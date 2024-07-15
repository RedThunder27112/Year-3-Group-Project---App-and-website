using LambdaPP_WebAPI_Alpha.Database.Models;

namespace LamdbdaPP_WebAPI_D3.Database.Models
{
    public class SkillWithLevel
    {
        public Skill skill { get; set; }
        public int level { get; set; }

        public SkillWithLevel(Skill skill, int Level) {
            this.skill = skill;
            this.level = Level;
        }
    }
}
