using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.Data.SqlClient;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "Equipment" table
    public class EquipmentQuery : AbstractQuery
    {
        //calls base constructor
        public EquipmentQuery(MyDbContext context) : base(context) { }

        public List<Equipment> GetEquipment()
        {
            return _context.Equipment.ToList();
        }

        //searches the names of the Equipment for a term
        public List<Equipment> SearchEquipment(String ToSearch)
        {
            return _context.Equipment.Where(a => a.Eqp_Name.Contains(ToSearch) && a.Eqp_Enabled == true).ToList();
        }

        //other methods needed:


        //edit equipment
        public int editEquipment(Equipment equipment)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Equipment.Where(a => a.Eqp_ID.Equals(equipment.Eqp_ID)).FirstOrDefault();

            s.Eqp_Name = equipment.Eqp_Name;
            s.Eqp_Description = equipment.Eqp_Description;

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

        //decrease equipment
        public int decreaseEquipment(Equipment equipment)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Equipment.Where(a => a.Eqp_ID.Equals(equipment.Eqp_ID)).FirstOrDefault();

            s.Eqp_Quantity_Total = s.Eqp_Quantity_Total;

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

        //add equipment
        public int addEquipment(Equipment equipment)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Equipment.Where(a => a.Eqp_ID.Equals(equipment.Eqp_ID)).FirstOrDefault();

            s.Eqp_Quantity_Total = s.Eqp_Quantity_Total;

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

        //new equipment
        public int newEqupment(Equipment equipment)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Equipment.Where(a => a.Eqp_ID.Equals(equipment.Eqp_ID)).FirstOrDefault();

            if (s != null)
            {
                editEquipment(s);
                s.Eqp_Enabled = true;

                _context.SaveChangesAsync();
                return 0;
            }


            try
            {
                _context.Equipment.Add(equipment);
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }
        }


        //delete equipment

        public bool deleteEqupment(int id)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Equipment.Where(a => a.Eqp_ID.Equals(id)).FirstOrDefault();

            s.Eqp_Enabled = false;

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
