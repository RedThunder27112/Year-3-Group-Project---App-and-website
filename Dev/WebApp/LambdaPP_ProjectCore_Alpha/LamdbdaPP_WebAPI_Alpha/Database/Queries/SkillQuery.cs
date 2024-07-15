using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.Data.SqlClient;

namespace LambdaPP_WebAPI_Alpha.Database.Queries
{
    //Contains all the queries related to the "Equipment" table
    public class SkillQuery : AbstractQuery
    {
        //calls base constructor
        public SkillQuery(MyDbContext context) : base(context) { }

        /*public List<Skill> GetSkills()
        {
            return _context.Skills.ToList();
        }

        //searches the names of the Skills for a term
        public List<Skill> SearchSkills(String ToSearch)
        {
            return _context.Skills.Where(a => a.Skill_Name.Contains(ToSearch)).ToList();
        }*/

        //other methods needed:

        //new Skill
        public int addSkill(Skill skill)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Skills.Where(a => a.Skill_ID.Equals(skill.Skill_ID)).FirstOrDefault();

            if (s != null)
            {
                editSkill(s);
                s.Skill_Enabled = true;
                _context.SaveChangesAsync();
                return 0;
            }


            try
            {
                _context.Skills.Add(skill);
                _context.SaveChangesAsync();
                return 0;
            }
            catch (Exception ex)
            {
                //todo: print exception deetz
                return -1;
            }
        }


        //delete Skill

        public bool deleteSkill(int id)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Skills.Where(a => a.Skill_ID.Equals(id)).FirstOrDefault();

            s.Skill_Enabled = false;

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

        //edit Skill
        public int editSkill(Skill skill)//not tested if works yet - did not make this async. Is that needed?
        {
            var s = _context.Skills.Where(a => a.Skill_ID.Equals(skill.Skill_ID)).FirstOrDefault();

            s.Skill_Name = skill.Skill_Name;
            s.Skill_Description = skill.Skill_Description;

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

    }
}
