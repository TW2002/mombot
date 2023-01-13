using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace MakeBot
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class Main : Window
    {
        public string Path { get; set; }
        public FileList Scripts { get; set; }
        public int Completed { get; set; }
        //public List<Task> Tasks { get; set; }

        private StreamWriter clog, elog, wlog;
        private int ccount, ecount, wcount;

        public Main(string[] args)
        {
            InitializeComponent();

            //List<Task> tasks = new List<Task>();

            Path = Environment.CurrentDirectory;
            Path = Path.Replace(@"\bin\Debug", "");
            Path = Path.Replace(@"\bin\Release", "");
            Path = Path.Replace(@"\MakeBot", "");
            //string file = $"{path}\\Installer\\Product.wxs";

            Scripts = new FileList(Path, args.ToList());
            ProgressBar.Maximum = Scripts.Files.Count();

            if (File.Exists("Compile.log")) File.Delete("Compile.log");
            if (File.Exists("Error.log")) File.Delete("Error.log");
            if (File.Exists("Warning.log")) File.Delete("Warning.log");

            clog = File.CreateText("Compile.log");
            elog = File.CreateText("Error.log");
            wlog = File.CreateText("Warning.log");
            ccount = 0;
            ecount = 0;
            wcount = 0;

        }

        private void onContentRendered(object sender, EventArgs e)
        {
            Stopwatch sw = new Stopwatch();
            List<Task> tasks = new List<Task>();

            ThreadPool.SetMaxThreads(100, 100);

            clog.WriteLine($"{DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")} Biliding Mombot 5");

            sw.Start();
            //foreach (var file in Scripts.Files.Take(10))
            foreach (var file in Scripts.Files)
            {
                var dst = new FileInfo("..\\" + file);
                if (!(dst.Directory.Exists))
                {
                    Directory.CreateDirectory(dst.DirectoryName);
                }

                tasks.Add(Task.Run(() => CompileScript(file)));
            }

            Task.Run(() => Task.WhenAll(tasks).Wait()).ContinueWith(t =>
            Dispatcher.Invoke(() =>
            {
                sw.Stop();
                FinishedLabel.Content = $"Elapsed Time { sw.Elapsed}";

                ProgressLabel.Content = $"Completed {ccount} of {Scripts.Files.Count()} with {ecount} error{(ecount==1?"":"s")}.";
                if(ecount > 0)
                    ErrorLabel.Visibility = Visibility.Visible;
                else
                    FinishedLabel.Visibility = Visibility.Visible;


                Cancel.Visibility = Visibility.Hidden;
                Finish.Visibility = Visibility.Visible;

                clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} Finished Compiling.");
                clog.Close();
                elog.Close();
                wlog.Close();
                if (ecount == 0) File.Delete("Error.log");
                if (wcount == 0) File.Delete("Warning.log");
            }));



        }

        private void CompileScript(string file)
        {
            Stopwatch sw = new Stopwatch();

            var f = new FileInfo(file);
            var cts = new FileInfo(file.Replace(".ts", ".cts"));
            var dst = new FileInfo("..\\" + file.Replace(".ts", ".cts"));

            if (f.Extension == ".ts")
            {
                if (cts.Exists) cts.Delete();

                var proc = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "twxc.exe",
                        //WorkingDirectory = f.DirectoryName,
                        Arguments = file,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    }
                };

                bool success = false;
                //int size, lines, def, cmds;
                int lines = 0;
                string line = "";

                sw.Start();
                proc.Start();
                while (!proc.StandardOutput.EndOfStream)
                {
                    line = proc.StandardOutput.ReadLine();

                    if (line == "Compilation successful.")
                        success = true;
                    //if (line.Contains("Code Size:"))
                    //    size = Int32.Parse(line.Split(' ')[2]);
                    if (line.Contains("Lines:"))
                        lines = Int32.Parse(line.Split(' ')[1]);
                    //if (line.Contains("Definitions:"))
                    //    size = Int32.Parse(line.Split(' ')[1]);
                    //if (line.Contains("Commands:"))
                    //    size = Int32.Parse(line.Split(' ')[1]);
                }
                sw.Stop();

                if (success == true)
                {
                    ccount++;
                    clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: Compiled {lines} lines in {sw.Elapsed}");

                    if (dst.Exists) dst.Delete();
                    cts.MoveTo(dst.FullName);

                }
                else
                {
                    ecount++;
                    clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: Failed to compile.");
                    clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: {line}.");

                    if (ecount == 1) elog.WriteLine($"{DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")} Biliding Mombot 5");
                    elog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: Failed to compile.");
                    elog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: {line}.");
                }
            }
            else
            {
                ccount++;
                wcount++;
                if (wcount == 1) wlog.WriteLine($"{DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")} Biliding Mombot 5");
                wlog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: No source file found.");

                if (dst.Exists) dst.Delete();
                cts.CopyTo(dst.FullName);
            }

            this.Dispatcher.Invoke(() =>
            {
                ProgressBar.Value = ++Completed;
                ProgressLabel.Content = $"Compiled: {cts.Name}";
            });


        }

        private void onCancelClick(object sender, RoutedEventArgs e)
        {

            Close();
        }
        private void onFinishClick(object sender, RoutedEventArgs e)
        {

            Close();
        }

        private void Grid_MouseDown(object sender, MouseButtonEventArgs e)
        {
            DragMove();
        }


    }
}
