using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace LambdaPP_WebAPI_Alpha.Database
{
    //This provides a connection to the database and allows for simple getting and setting to be done easily.
    //see WeatherForecastController which uses this class
    //see Program.cs which links this to the database (note: you may have to go here to fix the connection string for you!)
    //see Models. Each table in the database that we'll be reading from will require a Model
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

        //when we add more tables in, you'll need to add new instances like this. Eg public DbSet<Equipment> Equipment {get; set;}

        public DbSet<Request_Skill> Request_Skill { get; set; }
        public DbSet<Stock_Record> Stock_Record { get; set; }
        public DbSet<Feedback> Feedback { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<Notification> Notification { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Models.Task> Tasks { get; set; }
        public DbSet<Equipment> Equipment { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<Stock> Stock { get; set; }
        public DbSet<Task_Status> TaskStatuses { get; set; }
        public DbSet<Task_Update> Task_Updates { get; set; }

        public DbSet<Task_Employee_Bridge> Task_Employee_Bridges { get; set; }
        public DbSet<Task_Equipment_Bridge> Task_Equipment_Bridges { get; set; }
        public DbSet<Task_Stock_Bridge> Task_Stock_Bridges { get; set; }

        public DbSet<Employee_Skill_Bridge> Employee_Skill_Bridges { get; set; }

        public DbSet<Task_Skill_Bridge> Task_Skill_Bridges { get; set; }

        public DbSet<Task_Request> Task_Requests { get; set; }
        public DbSet<New_Employee_Code> New_Employee_Codes { get; set; }

        public DbSet<Task_Template> Task_Templates { get; set; }

        public DbSet<Task_Template_Skill_Bridge> Task_Template_Skill_Bridges { get; set; }

        public DbSet<SavedLocation> SavedLocations { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //many-to-many relationships
            //task-employees
            modelBuilder.Entity<Task_Employee_Bridge>()
                .HasOne(e => e.employee)
                .WithMany(te => te.Task_Employee_Bridges)
                .HasForeignKey(ei => ei.Emp_ID);
            modelBuilder.Entity<Task_Employee_Bridge>()
                .HasOne(t => t.task)
                .WithMany(te => te.Task_Employee_Bridges)
                .HasForeignKey(ti => ti.Task_ID);

            modelBuilder.Entity<Models.Task>()
                .HasMany(t => t.Task_Employee_Bridges)
                .WithOne(te => te.task)
                .HasForeignKey(te => te.Task_ID);
            modelBuilder.Entity<Employee>()
                .HasMany(e => e.Task_Employee_Bridges)
                .WithOne(te => te.employee)
                .HasForeignKey(te => te.Emp_ID);


            //task-stock
            /*modelBuilder.Entity<Task_Stock_Bridge>()
                .HasOne(e => e.stock)
                .WithMany(ts => ts.Task_Stock_Bridges)
                .HasForeignKey(ei => ei.Stock_ID);
            modelBuilder.Entity<Task_Stock_Bridge>()
                .HasOne(t => t.task)
                .WithMany(te => te.Task_Stock_Bridges)
                .HasForeignKey(ti => ti.Task_ID);*/
            //task-equipment
            modelBuilder.Entity<Task_Equipment_Bridge>()
                .HasOne(e => e.equipment)
                .WithMany(ts => ts.Task_Equipment_Bridges)
                .HasForeignKey(ei => ei.Eqp_ID);
            modelBuilder.Entity<Task_Equipment_Bridge>()
                .HasOne(t => t.task)
                .WithMany(te => te.Task_Equipment_Bridges)
                .HasForeignKey(ti => ti.Task_ID);

            //employee-skill
            modelBuilder.Entity<Employee_Skill_Bridge>()
              .HasOne(e => e.skill)
              .WithMany(ts => ts.Employee_Skill_Bridges)
              .HasForeignKey(ei => ei.Skill_ID);
            modelBuilder.Entity<Employee_Skill_Bridge > ()
                .HasOne(t => t.employee)
                .WithMany(te => te.Employee_Skill_Bridges)
                .HasForeignKey(ti => ti.Emp_ID);


            //task-skill
            /*modelBuilder.Entity<Task_Skill_Bridge>()
              .HasOne(e => e.skill)
              .WithMany(ts => ts.Task_Skill_Bridges)
              .HasForeignKey(ei => ei.Skill_ID);
            modelBuilder.Entity<Task_Skill_Bridge>()
                .HasOne(t => t.task)
                .WithMany(te => te.Task_Skill_Bridges)
                .HasForeignKey(ti => ti.Task_ID);

            modelBuilder.Entity<Models.Task>()
                .HasMany(t => t.Task_Skill_Bridges)
                .WithOne(ts => ts.task)
                .HasForeignKey(ts => ts.Task_ID);

            modelBuilder.Entity<Skill>()
               .HasMany(s => s.Task_Skill_Bridges)
               .WithOne(ts => ts.skill)
               .HasForeignKey(ts => ts.Skill_ID);*/

            //technically many-to-many but with the bridging table being more important than the link
            //ratings:
            //employee's task performance rating:


           /* modelBuilder.Entity<Rating>()
                .HasOne(t => t.task_Employee_Bridge)
                .WithMany(a => a.Ratings)
                .HasForeignKey(ei => ei.TEBridge_ID);*/
            //employee's given ratings
            modelBuilder.Entity<Rating>()
               .HasOne(t => t.reviewer)
               .WithMany(a => a.ratingsGiven)
               .HasForeignKey(ei => ei.reviewer_ID);

            //task updates:
            modelBuilder.Entity<Task_Update>()
                .HasOne(t => t.task)
                .WithMany(tu => tu.Task_Updates)
                .HasForeignKey(tu => tu.Task_ID);
            modelBuilder.Entity<Task_Update>()
                .HasOne(t => t.employee)
                .WithMany(tu => tu.Task_Updates)
                .HasForeignKey(tu => tu.Emp_ID);




            //one-to-many relationships
            //task-activity
            modelBuilder.Entity<Models.Task>()
                .HasOne(t => t.activity)
                .WithMany(a => a.tasks)
                .HasForeignKey(ei => ei.Act_ID);
            //task-status
            modelBuilder.Entity<Models.Task>()
                .HasOne(t => t.status)
                .WithMany(a => a.tasks)
                .HasForeignKey(ei => ei.Status_ID);
            //task update's updated status id

            //task's request
            modelBuilder.Entity<Task_Request>()
                .HasOne(tr => tr.Task)
                .WithMany(t => t.requests)
                .HasForeignKey(t => t.Task_ID);
            //employee's (admins) registration links

            //update's update media

            //user's user media

            //task-activity
            /*modelBuilder.Entity<Task_Template>()
                .HasOne(t => t.activity)
                .WithMany(a => a.tasks)
                .HasForeignKey(ei => ei.Act_ID);*/


            /*modelBuilder.Entity<Models.Task>()
                .HasMany(e => e.Employees)
                .WithMany(e => e.Tasks)
                .UsingEntity<Task_Employee_Bridge>();*/

            modelBuilder.Entity<Task_Template_Skill_Bridge>()
             .HasOne(t => t.Template)
             .WithMany(a => a.Task_Template_Skill_Bridges)
             .HasForeignKey(ei => ei.Template_ID);
        }
    }
}
