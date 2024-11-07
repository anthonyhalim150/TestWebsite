import java.io.IOException;
import java.util.StringTokenizer;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class Solution3 {

  public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "min max");
    job.setJarByClass(Solution3.class);
    job.setMapperClass(TokenizerMapper.class);
    job.setCombinerClass(IntMinMaxReducer.class);
    job.setReducerClass(IntMinMaxReducer.class);
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(IntWritable.class);
    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));
    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }

  public static class TokenizerMapper extends Mapper<Object, Text, Text, IntWritable> {

    private Text word = new Text();

    public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
      StringTokenizer itr = new StringTokenizer(value.toString());
      while (itr.hasMoreTokens()) {
        word.set(itr.nextToken());
        if (itr.hasMoreTokens()) {
          try {
            IntWritable counter = new IntWritable(Integer.parseInt(itr.nextToken()));
            context.write(word, counter);
          } catch (NumberFormatException e) {
            // Handle case where the second token is not an integer
            System.err.println("Invalid integer value found, skipping: " + e.getMessage());
          }
        }
      }
    }
  }

  public static class IntMinMaxReducer extends Reducer<Text, IntWritable, Text, Text> {
    private Text result = new Text();

    public void reduce(Text key, Iterable<IntWritable> values, Context context)
        throws IOException, InterruptedException {
      int max = Integer.MIN_VALUE;
      int min = Integer.MAX_VALUE;
      int sum = 0;
      int count = 0;

      for (IntWritable val : values) {
        int currentValue = val.get();
        if (currentValue > max)
          max = currentValue;
        if (currentValue < min)
          min = currentValue;
        sum += currentValue;
        count++;
      }

      int average = count == 0 ? 0 : sum / count;
      String stringResult = "max: " + max + " min: " + min + " Avg: " + average + " Total: " + sum;
      result.set(stringResult);
      context.write(key, result);
    }
  }
}
