namespace LambdaPP_WebAPI_Alpha.Helpers
{
    internal class DuplicateKeyComparer<T> : IComparer<T> where T : IComparable
    {
        public int Compare(T? x, T? y)
        {
            int res = x.CompareTo(y);

            //handle duplicates: since sorted list doesn't like duplicates, we just let one of the duplicates be "greater" than the other so it can still sort

            if (res == 0) return 1;
            else return res;
        }
    }
}