namespace LambdaPP_WebAPI_Alpha.Helpers
{
    public class DateLogicHelper
    {
        internal static bool isOverAYearOld(DateTime rating_Date)
        {
            //we're looking at "the past year" so is over a year old if it's a: from last year and b: from a month before the current month OR IF IT'S THE SAME MONTH then a day before current day
            
            //so: if year is this year or ahead, it can't be a year old
            if (rating_Date.Year >= DateTime.Today.Year) return false;
            //if older than last year, it's definitely older than a year old
            if (rating_Date.Year < (DateTime.Today.Year-1)) return true;

            //so it's from last year.
            //if month is ahead of this month, it's less than a year old
            if (rating_Date.Month > DateTime.Today.Month) return false;
            //if month before this month last year, definitely older than a year
            if (rating_Date.Month < DateTime.Today.Month) return true;


            //so it's from last year, this month.
            //if it's ahead of today, it's less than a year old
            if (rating_Date.Day >= DateTime.Today.Day) return false;
            //if month before this month last year, definitely older than a year
            else return true;


        }
    }
}
