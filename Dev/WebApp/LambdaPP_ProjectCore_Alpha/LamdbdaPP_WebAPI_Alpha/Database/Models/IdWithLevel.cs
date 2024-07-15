namespace LambdaPP_WebAPI_Alpha.Database.Models
{
    public class IdWithLevel
    {
        public int id { get; set; }
        public int level { get; set; }

        public IdWithLevel(int Id, int Level)
        {
            this.id = Id;
            this.level = Level;
        }
    }
}
