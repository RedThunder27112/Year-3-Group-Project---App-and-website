using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LambdaPP_WebAPI_Alpha.Database;
using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.AspNetCore.Cors;
using LambdaPP_WebAPI_Alpha.Helpers;
using Microsoft.IdentityModel.Tokens;

namespace LamdbdaPP_WebAPI_Alpha.Controllers
{
    /*
     * Purpose of this controller:
     * To deal with the adding, updating, removal of stock
     * For the stock for a specific task, see the task controller
     * 
     */
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class StocksController : ControllerBase
    {
        private readonly MyDbContext _context;

        public StocksController(MyDbContext context)
        {
            _context = context;
        }

        // GET: all Stocks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Stock>>> GetStock()
        {
          if (_context.Stock == null)
          {
              return NotFound();
          }
            return await _context.Stock.ToListAsync();
        }

        // GET: Stocks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Stock>> GetStock(int id)
        {
          if (_context.Stock == null)
          {
              return NotFound();
          }
            var stock = await _context.Stock.FindAsync(id);

            if (stock == null)
            {
                return NotFound();
            }

            return stock;
        }

        // GET: Equipments/5
        [HttpGet("{id}/quantityavailable")]
        public async Task<ActionResult<int>> GetStockQuantityAvailable(int id)
        {
            if (_context.Stock == null)
            {
                return NotFound();
            }
            var stock = await _context.Stock.FindAsync(id);

            if (stock == null)
            {
                return NotFound();
            }

            if (_context.Task_Stock_Bridges == null)
            {
                return NotFound();
            }

            //here we kinda are doing the opposite of what we did with equipment.
            //the database has an accurate tally of the stock that really is there, so we don't need to alter that value
            //so here we're saying stock that's been requested but not approved is excluded from this amount, because it's in limbo - schrodinger's stock
            //but the database's Stock_Quantity will still represent it
            //and when the stock request is then handled and approved or denied, the changes go to the database so it gets sorted out. So we only need to consider this in-between period

            var stocksNeededButNotYetUsed = _context.Task_Stock_Bridges.Where(tsb => tsb.Stock_ID == id && tsb.TS_Enabled == true && tsb.Quantity_Used == 0).ToList();
            var availablequantity = stock.Stock_Quantity;
            if (stocksNeededButNotYetUsed.Count > 0)
            {
                foreach (Task_Stock_Bridge t in stocksNeededButNotYetUsed)
                {
                    availablequantity -= t.Quantity_Needed;
                }
            }

            return availablequantity;
        }

        // GET: quantity used per month
        [HttpGet("{id}/quantityUsedPerMonth")]
        public async Task<ActionResult<IEnumerable<int>>> GetStockQuantityUserPerMonth(int id)
        {
            if (_context.Stock == null)
            {
                return NotFound();
            }
            var stock = await _context.Stock.FindAsync(id);

            if (stock == null)
            {
                return NotFound();
            }

            if (_context.Stock_Record == null)
            {
                return NotFound();
            }

            //initialise stock month list
            int[] StocksPerMonth = new int[12];
            for (int i = 0; i < 12; i++)
                StocksPerMonth[i] = 0;

            var stocksUsed = _context.Stock_Record.Where(tsb => tsb.Stock_ID == id  && tsb.Record_Amount != 0).ToList();
            
            if (stocksUsed.Count > 0)
            {
                foreach (Stock_Record t in stocksUsed)
                {
                    if (!DateLogicHelper.isOverAYearOld(t.Record_Date))
                    {
                        //get the month, and record in the correct spot in the array
                        int month = t.Record_Date.Month - 1;
                        StocksPerMonth[month] += t.Record_Amount;
                    }         
                }
            }
            return StocksPerMonth;
        }


        // GET: quantity used per month
        [HttpGet("records")]
        public async Task<ActionResult<IEnumerable<Stock_Record>>> GetStockRecords()
        {
            if (_context.Stock_Record == null)
            {
                return NotFound();
            }

            return await _context.Stock_Record.ToListAsync();
        }
        [HttpGet("{id}/image")]
        public IActionResult GetImg(int id)
        {
            //validate id
            if (!StockExists(id)) { return NotFound(); }
            
            return ImageFileHandler.getImage("stock", id, this);
        }

        // GET: all stock, with low stock 
        [HttpGet("lowstockreport")]
        public async Task<ActionResult<IEnumerable<Low_Stock>>> GetLowStockWarning()
        {
            if (_context.Stock == null)
            {
                return NotFound();
            }

            var stock = _context.Stock.ToList();
          
            List<Low_Stock> lowStockList = new List<Low_Stock>();
            foreach (Stock s in stock) 
            {
                //calc monthly average
                var recordList = await _context.Stock_Record.Where(t => t.Stock_ID == s.Stock_ID).ToListAsync();

                if (recordList != null)
                {
                    //months
                    int[] monthAmounts = new int[12];

                    //add total amounts to each month
                    foreach (Stock_Record record in recordList)
                    {
                        if (record.Record_Date.Year == DateTime.Now.Year)
                        {
                            monthAmounts[record.Record_Date.Month - 1] += record.Record_Amount;
                        }

                    }

                    int numMonths = 0;
                    int monthTotal = 0;
                    for (int i = 0; i < 12; i++)
                    {
                        if (monthAmounts[i] > 0)
                        {
                            numMonths++;
                            monthTotal += monthAmounts[i];
                        }
                    }

                    if(s.Stock_Lead_Time != null)
                    {
                        monthTotal += s.Stock_Lead_Time;
                    }
                

                    int monthAvg = 0;

                    if(numMonths > 0)
                    {
                        monthAvg = monthTotal / numMonths;
                    }
                    
                    //end calc monthly average


                    if (s.Stock_Quantity <= monthAvg)//runs out in month
                    {
                        Low_Stock lowStock = new Low_Stock();
                        lowStock.Stock_ID = s.Stock_ID;

                        if (s.Stock_Quantity <= monthAvg)//runs out in month
                        {
                            lowStock.Month = true;
                        }

                        if(monthAvg > 0)
                        {
                            if (s.Stock_Quantity <= (monthAvg / 2))//runs out in 2 weeks
                            {
                                lowStock.Bi_Week = true;
                            }
                            if (s.Stock_Quantity <= (monthAvg / 4))//runs out in week
                            {
                                lowStock.Week = true;
                            }

                            lowStock.Usage_Bi_Weekly = monthAvg / 2;
                            lowStock.Usage_Weekly = monthAvg / 4;
                        }
                        lowStock.Usage_Monthly = monthAvg;




                        lowStock.Stock_Quantity = s.Stock_Quantity;

                        lowStockList.Add(lowStock);
                    }
                }
            }

            return lowStockList;
        }
        [HttpGet("lowstockreport/{id}")]
        public async Task<ActionResult<Low_Stock>> GetLowStockWarning(int id)
        {
            if (_context.Stock == null)
            {
                return NotFound();
            }

            var s= _context.Stock.Where(s => s.Stock_ID == id).FirstOrDefault();

            if (s == null) return NotFound();
           
            //calc monthly average
            var recordList = await _context.Stock_Record.Where(t => t.Stock_ID == s.Stock_ID).ToListAsync();
            Low_Stock lowStock = new Low_Stock();
            if (recordList != null)
            {
                //months
                int[] monthAmounts = new int[12];

                //add total amounts to each month
                foreach (Stock_Record record in recordList)
                {
                    if (record.Record_Date.Year == DateTime.Now.Year)
                    {
                        monthAmounts[record.Record_Date.Month - 1] += record.Record_Amount;
                    }

                }

                int numMonths = 0;
                int monthTotal = 0;
                for (int i = 0; i < 12; i++)
                {
                    if (monthAmounts[i] > 0)
                    {
                        numMonths++;
                        monthTotal += monthAmounts[i];
                    }
                }

                if (s.Stock_Lead_Time != null)
                {
                    monthTotal += s.Stock_Lead_Time;
                }


                int monthAvg = 0;

                if (numMonths > 0)
                {
                    monthAvg = monthTotal / numMonths;
                }

                //end calc monthly average


                if (s.Stock_Quantity <= monthAvg)//runs out in month
                {
                    
                    lowStock.Stock_ID = s.Stock_ID;

                    if (s.Stock_Quantity <= monthAvg)//runs out in month
                    {
                        lowStock.Month = true;
                    }

                    if (monthAvg > 0)
                    {
                        if (s.Stock_Quantity <= (monthAvg / 2))//runs out in 2 weeks
                        {
                            lowStock.Bi_Week = true;
                        }
                        if (s.Stock_Quantity <= (monthAvg / 4))//runs out in week
                        {
                            lowStock.Week = true;
                        }

                        lowStock.Usage_Bi_Weekly = monthAvg / 2;
                        lowStock.Usage_Weekly = monthAvg / 4;
                    }
                    lowStock.Usage_Monthly = monthAvg;




                    lowStock.Stock_Quantity = s.Stock_Quantity;

                    
                }
            }

            return lowStock;
        }



        [HttpPost("{id}/image")]
        public async Task<IActionResult> PostPic(int id, IFormFile file)
        {
            //validate id
            if (!StockExists(id)) { return NotFound(); }

            return await ImageFileHandler.postImage("stock", id, file, this);
        }

        // PUT: Stocks/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStock(int id, Stock stock)
        {
            if (id != stock.Stock_ID)
            {
                return BadRequest();
            }

            _context.Entry(stock).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StockExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: Stocks
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Stock>> PostStock(Stock stock)
        {
          if (_context.Stock == null)
          {
              return Problem("Entity set 'MyDbContext.Stock'  is null.");
          }
            _context.Stock.Add(stock);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStock", new { id = stock.Stock_ID }, stock);
        }

        // DELETE: Stocks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStock(int id)
        {
            if (_context.Stock == null)
            {
                return NotFound();
            }
            var stock = await _context.Stock.FindAsync(id);
            if (stock == null)
            {
                return NotFound();
            }

            _context.Stock.Remove(stock);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StockExists(int id)
        {
            return (_context.Stock?.Any(e => e.Stock_ID == id)).GetValueOrDefault();
        }


        //TODO: - update stock quantity only?
        //return unused stock?

        //request stock for task - add the entry to the bridge, but no equip given

        //assign stock to task - if the entry exists already, change amount. Else add it then change amount. 
        //BE SURE TO CHANGE THE STOCK LEVEL AT THIS POINT

        


    }
}
