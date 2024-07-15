using LambdaPP_WebAPI_Alpha.Database;
using LambdaPP_WebAPI_Alpha.Database.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ML;
using System.Collections.Generic;

namespace LambdaPP_WebAPI_Alpha.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [EnableCors("AllowOrigin")]
    public class AIController : ControllerBase
    {
        private readonly MyDbContext _context;
        public AIController(MyDbContext context)
        {
            _context = context;
        }
        // GET: Activities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<String>>> GetVectorisedComments()
        {
            var reviews = await _context.Ratings.Where(r => r.Rating_Comment != "" && r.Rating_Comment != null).ToListAsync();
            
            //display the data as a string
            var featureStrings = new List<String>();
            foreach (var rating in reviews)           
                featureStrings.Add(rating.Rating_ID + ": " + rating.Rating_Vector);  
            
            return new ActionResult<IEnumerable<String>>(featureStrings);

        }
        [HttpGet("Revectorised")]
        public async Task<ActionResult<IEnumerable<String>>> RevectoriseComments()
        {
            var reviews = await _context.Ratings.Where(r => r.Rating_Comment != "" && r.Rating_Comment != null).ToListAsync();
            var features = await VectoriseReviewComments();
            //display the data as a string
            var featureStrings = new List<String>();
            foreach (var rating in features)
            {
                String vectorString = string.Join(" ", rating.Features);
                featureStrings.Add(rating.Rating_ID + ": " + vectorString);

                //save to db
                var review = await _context.Ratings.Where(r => r.Rating_ID == rating.Rating_ID).FirstOrDefaultAsync();
                review.Rating_Vector = vectorString;
                if (review.Rating_Category == null)
                    review.Rating_Category = (int?)RatingCategory.UNCATEGORISED;
                await _context.SaveChangesAsync(); 
            }
            return new ActionResult<IEnumerable<String>>(featureStrings);

        }
        // GET: Nearest Neighbours
        [HttpGet("nearestNeighbours/{id}")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetNearestNeigbour(int id)
        {
            List<TransformedData> features = (await ratingsAsTransformedDataAsync()).ToList();
            var featureIndex = features.FindIndex(e => e.Rating_ID == id);
            var neighbours = nearestNeighbours(features, featureIndex);
            if (neighbours == null) return NotFound();

            //display the data as a string
            var featureStrings = new List<Rating>();
            while (neighbours.Count > 0 && featureStrings.Count() < 100) 
            {
                TransformedData neighbour;
                double distance;
                neighbours.TryDequeue(out neighbour, out distance);
                var review = await _context.Ratings.Where(r => r.Rating_ID == neighbour.Rating_ID).FirstOrDefaultAsync();
                featureStrings.Add(review);
            }
            return new ActionResult<IEnumerable<Rating>>(featureStrings);

        }
        [HttpGet("nearestNeighbours/{id}/withWeight")]
        public async Task<ActionResult<IEnumerable<KeyValuePair<double, Rating>>>> GetNearestNeigbourwWeight(int id)
        {
            List<TransformedData> features = (await ratingsAsTransformedDataAsync()).ToList();
            var featureIndex = features.FindIndex(e => e.Rating_ID == id);
            var neighbours = nearestNeighbours(features, featureIndex);
            if (neighbours == null) return NotFound();
            List<KeyValuePair<double, Rating>> output = new List<KeyValuePair<double, Rating>>();

            while (neighbours.Count > 0 && output.Count() < 100)
            {
                TransformedData neighbour;
                double distance;
                neighbours.TryDequeue(out neighbour, out distance);
              
                var review = await _context.Ratings.Where(r => r.Rating_ID == neighbour.Rating_ID).FirstOrDefaultAsync();
                output.Add(new KeyValuePair<double, Rating>(distance, review));
            }
            return new ActionResult<IEnumerable<KeyValuePair<double, Rating>>>(output);

        }

        [HttpGet("suggestedCategory/{id}")]
        public async Task<ActionResult<int>> SuggestCategory(int id)
        {
            List<TransformedData> features = (await ratingsAsTransformedDataAsync()).ToList();
            var featureIndex = features.FindIndex(e => e.Rating_ID == id);
            var category = determineCategory(features, featureIndex);
            
            return new ActionResult<int>(category);

        }
        [HttpGet("saveCategory/{id}/{category}")]
        public async Task<ActionResult> SaveCategory(int id, int category)
        {
            var rating = await _context.Ratings.FindAsync(id);
            if ((rating == null))
            {
                return NotFound();
            }

            _context.Entry(rating).State = EntityState.Modified;
            rating.Rating_Category = category;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if ((rating != null))
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


        /*[HttpPost("SetCategory")]
        public async Task<ActionResult<int>> SetCategory(int id, int category)
        {
            Rating? review = await _context.Ratings.Where(r => r.Rating_ID == id).FirstOrDefaultAsync();
            if (review == null) return NotFound();

            review.Rating_Category = category;
            await _context.SaveChangesAsync();

            return new ActionResult<int>(category);

        }*/

        // GET: Reviews
        [HttpGet("review/{id}")]
        public async Task<ActionResult<Rating>> GetReview(int id)
        {
            return await _context.Ratings.Where(r => r.Rating_ID == id).FirstOrDefaultAsync();
        }

        [HttpGet("reviewsWithComments")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetReviews()
        {
            return await _context.Ratings.Where(r => r.Rating_Comment != "").ToListAsync();
        }

        // given a team, report on if there are issues:
        // if 1 team member has posted inappropriate comments about another
        // if 1 team member has posted like over 5 negative comments about someone, flag it, say what % of comments about this person are negative
        [HttpPost("teamCompatability")]
        public async Task<ActionResult<IEnumerable<String>>> teamCompatability(List<Employee> team)
        {
            List<String> issues = new List<string>();
            List<int?> teamIDs = team.Select(t => t.Emp_ID).ToList();
            foreach( Employee e in team)
            {
                var empReviews = _context.Ratings.Where(r => r.Emp_ID == e.Emp_ID && teamIDs.Contains(r.reviewer_ID) && r.Rating_Category > 0).ToList();
                if (!empReviews.IsNullOrEmpty())
                {
                    List<int> uniqueReviewers = empReviews.Select(r => r.reviewer_ID).Distinct().ToList();
                    foreach (int i  in uniqueReviewers)
                    {

                        var countNegative = empReviews.Where(r => r.Rating_Category == (int)RatingCategory.NEGATIVE && r.reviewer_ID==i).Count();
                        if (countNegative > 3)
                        {
                            //over 5 negative reviews seems like a lot, but let's see what the % is
                            int Percentage = countNegative * 100 / empReviews.Where(r => r.reviewer_ID == i).Count();
                            if (Percentage > 50)
                            {
                                var meanReviewer = _context.Employees.Where(emp => emp.Emp_ID == i).FirstOrDefault();
                                issues.Add($"{meanReviewer.Emp_Name} {meanReviewer.Emp_Sur} does not seem to get on with {e.Emp_Name} {e.Emp_Sur} as {Percentage}% of their reviews have a negative sentiment");
                            }
                        }

                        var countProblematic = empReviews.Where(r => r.Rating_Category == (int)RatingCategory.INAPPROPRIATE && r.reviewer_ID == i).Count();
                        if (countProblematic > 0)
                        {
                            var meanReviewer = _context.Employees.Where(emp => emp.Emp_ID == i).FirstOrDefault();
                            issues.Add($"{meanReviewer.Emp_Name} {meanReviewer.Emp_Sur} has reviewed {e.Emp_Name} {e.Emp_Sur} in an inappropriate manner in {countProblematic} reviews");
                        }

                    }
                }
            }

            return issues;
        }

        async Task<IEnumerable<TransformedData>> VectoriseReviewComments()
        {
            var reviews = await _context.Ratings.Where(r => r.Rating_Comment != "" && r.Rating_Comment != null).ToListAsync();

            var mlContext = new MLContext();
            //take the review data from the database and prepare it for vectorisation
            var data = new List<SentimentData>();
            foreach (Rating r in reviews)
            {
                int category = (int)((r.Rating_Category != null) ? r.Rating_Category : 0);
                data.Add(new SentimentData { Rating_Comment = r.Rating_Comment, Rating_ID = r.Rating_ID, Category = category});
            }

            // Load the data into the mlContext
            var dataView = mlContext.Data.LoadFromEnumerable(data);

            // Define the text transformation pipeline - a set of steps that instructs how the vectorisation will happen
            // I've found 2 different methods that work 
            // Featurize text method: A "composition of several basic transforms" that "can be used as a featurizer to perform text classification."
            // The important step is the FeaturizeText step, which vectorises the text based on word frequency, sort of a "bag-of-words" approach counting n-grams and char-grams.
            // ApplyWordEmbedding method:
            // This uses a pretrained dataset to do the vectorisation. each word is mapped to a vector in this pretrained way.
            // with this method we'd need to pick a pretrained model to use, eg GloVe, or "SentimentSpecificWordEmbedding"

            //Apply Word Embedding Method
            var pipeline = mlContext.Transforms.Text.NormalizeText("Rating_Comment")
                .Append(mlContext.Transforms.Text.TokenizeIntoWords("Tokens","Rating_Comment"))
                .Append(mlContext.Transforms.Text.ApplyWordEmbedding("Features", "Tokens", Microsoft.ML.Transforms.Text.WordEmbeddingEstimator.PretrainedModelKind.SentimentSpecificWordEmbedding));

            // Featurize Text Method
            /*var pipeline = mlContext.Transforms.Text.FeaturizeText("Features", "Rating_Comment")
                .Append(mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"));*/

            // put the data into the pipeline, then transform it
            var model = pipeline.Fit(dataView);
            var transformedData = model.Transform(dataView);

            //now the data has been vectorised
            //preview just used to preview what the data looks like
            var preview = transformedData.Preview();
            //get the data as a list
            var features = mlContext.Data.CreateEnumerable<TransformedData>(transformedData, reuseRowObject: false);
            int dimension = features.First().Features.Length;
            foreach (var f in features)
                if (f.Features.Length != dimension)
                    Console.WriteLine("INCONSISTENT FEATURE LENGTH DURING GENERATION");
            return features;
        }

        //vectorising 1 single review
       
        internal async Task<TransformedData> VectoriseReviewComment(int ReviewID)
        {
            var r = await _context.Ratings.Where(r => r.Rating_ID == ReviewID).FirstOrDefaultAsync();
            if (r == null) return null;

            return VectoriseReviewComment(r).Result;
        }
        
        internal async Task<TransformedData> VectoriseReviewComment(Rating r)
        {
            var mlContext = new MLContext();
            //take the review data from the database and prepare it for vectorisation
            var data = new List<SentimentData>();
            data.Add(new SentimentData { Rating_Comment = r.Rating_Comment, Rating_ID = r.Rating_ID });

            // Load the data into the mlContext
            var dataView = mlContext.Data.LoadFromEnumerable(data);

            // Define the text transformation pipeline - a set of steps that instructs how the vectorisation will happen
            /*var pipeline = mlContext.Transforms.Text.FeaturizeText("Features", "Rating_Comment")
                .Append(mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"))
                .Append(mlContext.Transforms.Concatenate("Features", "Features"))
                .Append(mlContext.Transforms.NormalizeMeanVariance("Features"));*/
            //Apply Word Embedding Method
            var pipeline = mlContext.Transforms.Text.NormalizeText("Rating_Comment")
                .Append(mlContext.Transforms.Text.TokenizeIntoWords("Tokens", "Rating_Comment"))
                .Append(mlContext.Transforms.Text.ApplyWordEmbedding("Features", "Tokens", Microsoft.ML.Transforms.Text.WordEmbeddingEstimator.PretrainedModelKind.SentimentSpecificWordEmbedding));

            // put the data into the pipeline, then transform it
            var model = pipeline.Fit(dataView);
            var transformedData = model.Transform(dataView);

            //now the data has been vectorised
            //preview just used to preview what the data looks like
            var preview = transformedData.Preview();
            //get the data as a list
            var features = mlContext.Data.CreateEnumerable<TransformedData>(transformedData, reuseRowObject: false);
            TransformedData vectorisedReview = features.SingleOrDefault();
            return vectorisedReview;
        }
        //not really for front end use necessarily, just for testing purposes. Doesn't make any changes to DB
        [HttpPost("vectoriseReviewtoString")]
        public async Task<string> VectoriseReviewCommentToString(Rating r)
        {
            TransformedData vectorisedReview = VectoriseReviewComment(r).Result;
            return string.Join(" ", vectorisedReview.Features);
        }



        PriorityQueue<TransformedData, Double> nearestNeighbours(IEnumerable<TransformedData> vectors, int index)
        {
            //have the list of vectors in the space, and the index of the vector we want to find the nearest neighbours of
            if (index < 0) return null;
            if (index >= vectors.Count()) return null;

            TransformedData vector = vectors.ElementAt(index);
            List<TransformedData> vectorOnlyList = new List<TransformedData>();
            vectorOnlyList.Add(vector);
            List <TransformedData> neighbours = vectors.Except(vectorOnlyList).ToList();

            PriorityQueue<TransformedData, Double> neighboursWithDistance = new PriorityQueue<TransformedData, double>();

            foreach (TransformedData neighbour in neighbours)
            {
                double distance = distanceBetween(vector, neighbour);
                if (distance < 0)
                    Console.Write("vectors are not of the same length!");
                neighboursWithDistance.Enqueue(neighbour, distance);
            }
            return neighboursWithDistance;
        }
        int determineCategory(IEnumerable<TransformedData> vectors, int index)
        {
            var neighbours = nearestNeighbours(vectors,index);
            if (neighbours == null) return -1;
            int neighbourCount = vectors.Count() - 1;
            if (neighbourCount <= 0) return -1;

            double Category = 0;
            int count = 0;
            double TotalWeight = 0;
            while (neighbours.Count > 0)
            {
                count++;
                var neighbour = neighbours.Dequeue();
                //skip uncategorised neighbours
                if (neighbour.Category == 0) continue;
                double distance = Math.Abs(distanceBetween(neighbour, vectors.ElementAt(index)));
                double weight = Math.Pow(2, -distance); //closest neighbours count more, doing a weighted average

                TotalWeight += weight;
                Category += (double)neighbour.Category * weight;  
            }
            Category = Category / (TotalWeight);
            int CategoryInt = (int)Math.Round(Category);
            return CategoryInt;
        }


        Double distanceBetween(TransformedData v1, TransformedData v2)
        {
            //distance in 2d = sqrt ( (x1-x2)^2 + (y1-y2)^2)
            //distance in any higher dimension continues that trend
            int vectorSize = v1.Features.Length;
            if (v2.Features.Length != vectorSize) return -1;

            Double distance = 0;
            for (int i = 0; i < vectorSize; i++)
            {
                distance += Math.Pow(v1.Features[i] - v2.Features[i], 2);
            }
            distance = Math.Sqrt(distance);
            return distance;
        }
        internal List<TransformedData> ratingsAsTransformedData(List<Rating> ratings)
        {
            List<TransformedData> transformedRatings = new List<TransformedData>();
            int Dimension = -1;
            foreach(Rating r in ratings)
            {
               
                TransformedData data;
                if (r.Rating_Vector != null)
                {
                    List<float> features = stringToFeatureList(r.Rating_Vector);
                    data = new TransformedData
                    {
                        Rating_ID = r.Rating_ID,
                        Category = (int)r.Rating_Category,
                        Features = features.ToArray()
                    };
                    if (Dimension == -1)
                        Dimension = data.Features.Length;
                    else if (Dimension != data.Features.Length)
                        Console.WriteLine("features from db not of consistant length!");
                }  
                else
                {
                    data = VectoriseReviewComment(r).Result;
                    if (Dimension == -1)
                        Dimension = data.Features.Length;
                    else if (Dimension != data.Features.Length)
                        Console.WriteLine("new featurisation doesn't match!");
                }
               
                transformedRatings.Add(data);
            }    

            return transformedRatings;
        }
        internal async Task<List<TransformedData>> ratingsAsTransformedDataAsync()
        {
            var reviews = await _context.Ratings.Where(r => r.Rating_Comment != "" && r.Rating_Comment != null).ToListAsync();
            return ratingsAsTransformedData(reviews);
        }

        private List<float> stringToFeatureList(string rating_Vector)
        {
            List<float> features = new List<float>();
            string[] splitStrings = rating_Vector.Split(" ");
            foreach( string splitString in splitStrings)
            {
                features.Add(float.Parse(splitString));
            }

            return features;
        }
    }


    public class TransformedData
    {
        public float[] Features;
        public int Rating_ID = 0;
        public int Category = (int)RatingCategory.UNCATEGORISED;
    }
    public class SentimentData
    {
        public string Rating_Comment;
        public int Rating_ID;
        public int Category = (int)RatingCategory.UNCATEGORISED;
    }

    public enum RatingCategory
    {
        UNCATEGORISED,
        POSITIVE,
        NEUTRAL,
        NEGATIVE,
        INAPPROPRIATE
    }
}
