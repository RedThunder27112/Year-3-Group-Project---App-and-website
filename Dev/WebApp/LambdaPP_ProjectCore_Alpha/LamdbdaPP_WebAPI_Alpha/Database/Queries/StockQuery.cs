using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.Data.SqlClient;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "Stock" table
    public class StockQuery : AbstractQuery
    {
        //calls base constructor
        public StockQuery(MyDbContext context) : base(context) { }

        public List<Stock> GetStock()
        {
            return _context.Stock.ToList();
        }

        //searches the names of the Skills for a term
        public List<Stock> SearchStock(String ToSearch)
        {
            return _context.Stock.Where(a => a.Stock_Name.Contains(ToSearch) && a.Stock_Enabled == true).ToList();
        }

        //other methods needed:

        //edit stock
        public int editStock(Stock stock)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Stock.Where(a => a.Stock_ID.Equals(stock.Stock_ID)).FirstOrDefault();

            s.Stock_Name = stock.Stock_Name;
            s.Stock_Quantity = stock.Stock_Quantity;
            s.Stock_Description = stock.Stock_Description;

            try
            {
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }
        }

        //decrease stock
        public int decreaseStock(Stock stock)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Stock.Where(a => a.Stock_ID.Equals(stock.Stock_ID)).FirstOrDefault();

            s.Stock_Quantity = stock.Stock_Quantity;

            try
            {
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }
        }

        //add stock
        public int addStock(Stock stock)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Stock.Where(a => a.Stock_ID.Equals(stock.Stock_ID)).FirstOrDefault();

            s.Stock_Quantity = stock.Stock_Quantity;

            try
            {
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }
        }

        //new stock
        public int newStock(Stock stock)//not tested if works yet - did not make this async. Is that needed?
        {

            var s = _context.Stock.Where(a => a.Stock_ID.Equals(stock.Stock_ID)).FirstOrDefault();

            if (s != null)//test if stock already exists
            {

                editStock(s);
                s.Stock_Enabled = true;
                _context.SaveChangesAsync();
                return 0;
            }

            try
            {
                _context.Stock.Add(stock);
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }






        }


        //delete stock

        public bool deleteStock(int id)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Stock.Where(a => a.Stock_ID.Equals(id)).FirstOrDefault();

            s.Stock_Enabled = false;

            try
            {
                _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return false;
            }
        }
    }
}
