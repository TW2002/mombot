using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace MakeBot
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class Main : Window
    {
        // Public Properties.
        public string Path { get; set; }
        public FileList Scripts { get; set; }
        public int Completed { get; set; }

        // Private streams for logs, and progress counters.
        private StreamWriter clog, elog, wlog;
        private int ccount, ecount, wcount;

        /// <summary>
        /// Main window constructor.
        /// </summary>
        /// <param name="args">Command lione arguments passed from app.xaml.cs</param>
        public Main(string[] args)
        {
            InitializeComponent();

            // Get the working directory.
            Path = Environment.CurrentDirectory;

            // Enumerate all scripts, filterd by command line args and
            // set progress bar max value.
            Scripts = new FileList(Path, args.ToList());
            ProgressBar.Maximum = Scripts.Files.Count();

            // Create script top create help files
            //script = File.CreateText("MakeHelp.ts");

            // Delete the old log files if they exist.
            if (File.Exists("Compile.log")) File.Delete("Compile.log");
            if (File.Exists("Error.log")) File.Delete("Error.log");
            if (File.Exists("Warning.log")) File.Delete("Warning.log");

            // Create the log files.
            clog = File.CreateText("Compile.log");
            elog = File.CreateText("Error.log");
            wlog = File.CreateText("Warning.log");

            // Reset progress counters.
            ccount = 0;
            ecount = 0;
            wcount = 0;
        }

        /// <summary>
        /// Content rendered event for main window.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void onContentRendered(object sender, EventArgs e)
        {
            Stopwatch sw = new Stopwatch();
            List<Task> tasks = new List<Task>();

            // Set the max number of threads. May need to adjust this.
            ThreadPool.SetMaxThreads(100, 100);

            // Initulize the log file with a header.
            clog.WriteLine($"{DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")} Biliding Mombot 5");

            sw.Start();
            foreach (var file in Scripts.Files)
            {
                // Get the destination file name. 
                var dst = new FileInfo("..\\" + file);
                if (!(dst.Directory.Exists))
                {
                    //Create the folder if it does not exist.
                    Directory.CreateDirectory(dst.DirectoryName);
                }

                // Create a task to compile each sceipt file.
                tasks.Add(Task.Run(() => CompileScript(file)));
            }

            // Create a task that will fire when all scripts have been compiled.
            Task.Run(() => Task.WhenAll(tasks).Wait()).ContinueWith(t =>
            Dispatcher.Invoke(() =>
            {
                // Copy startup scripts.
                CopyStartup("Watcher");
                CopyStartup("ViewScreen");
                CopyStartup("Chat");
                CopyStartup("EpHaggle");

                sw.Stop();

                // Update the progress label with total counts.
                ProgressLabel.Content = $"Completed {ccount} of {Scripts.Files.Count()} with {ecount} error{(ecount == 1 ? "" : "s")}.";

                // Update the finished label with elapsed time.
                FinishedLabel.Content = $"Elapsed Time { sw.Elapsed}";

                if(ecount > 0)
                    // Display the error label if there were errors.
                    ErrorLabel.Visibility = Visibility.Visible;
                else
                    // Display the finished labeel. 
                    FinishedLabel.Visibility = Visibility.Visible;

                // HIde the cancel button, and show the finish button.
                Cancel.Visibility = Visibility.Hidden;
                Finish.Visibility = Visibility.Visible;

                // Update and close the log files.
                clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} Finished Compiling.");
                clog.Close();
                elog.Close();
                wlog.Close();

                // Close the help file creation script.
                //script.Close();

                // If ther were no errors or warnings delete the files.
                if (ecount == 0) File.Delete("Error.log");
                if (wcount == 0) File.Delete("Warning.log");

                // Launch TWX Proxy to extract the Help files.
                //if (File.Exists(@"..\..\..\twxp.exe"))
                    //Process.Start(@"..\..\..\twxp.exe", @"Scripts\MomBot\MakeHelp.cts");
            }));
        }

        /// <summary>
        /// Copy duplicates of scripts to the startups folder.
        /// </summary>
        /// <param name="file">Script to copy.</param>
        private void CopyStartup(string file)
        {
            var cts = new FileInfo($"..\\daemons\\{file}.cts");
            var dst = new FileInfo($"..\\startups\\{file}.cts");

            if (!(dst.Directory.Exists))
            {
                //Create the folder if it does not exist.
                Directory.CreateDirectory(dst.DirectoryName);
            }

            // Copy the file.
            if (dst.Exists) dst.Delete();
            cts.CopyTo(dst.FullName);
        }

        /// <summary>
        /// Compiles each script and moves it to the destination folder.
        /// </summary>
        /// <param name="file"></param>
        private void CompileScript(string file)
        {
            Stopwatch sw = new Stopwatch();

            var f = new FileInfo(file);
            var cts = new FileInfo(file.Replace(".ts", ".cts"));
            var dst = new FileInfo("..\\" + file.Replace(".ts", ".cts"));
            var txt = new FileInfo("..\\Help\\" + cts.Name.Replace(".cts", ".txt"));

            if (f.Extension == ".ts")
            {
                bool success = false;
                int lines = 0;
                string line = "";

                // Delete the old file if it exists.
                if (cts.Exists) cts.Delete();

                // Create a process to compile the file.
                var proc = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "twxc.exe",
                        Arguments = file,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    }
                };

                // Start a timer and the process.
                sw.Start();
                proc.Start();

                // Process output from the process.
                while (!proc.StandardOutput.EndOfStream)
                {
                    // Read each line from output stream.
                    line = proc.StandardOutput.ReadLine();

                    // Parse each line for succes and line count.
                    if (line == "Compilation successful.")
                        success = true;
                    if (line.Contains("Lines:"))
                        lines = Int32.Parse(line.Split(' ')[1]);
                }
                sw.Stop();

                if (success == true)
                {
                    ccount++;

                    // Update the log file.
                    clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: Compiled {lines} lines in {sw.Elapsed}");

                    // Move the script to the destination folder.
                    if (dst.Exists) dst.Delete();
                    cts.MoveTo(dst.FullName);

                    // Add the file to the Make Help script, if it does not have a help file.
                    //if (txt.Name != "mombot.txt" && !txt.Exists)
                        //script.WriteLine($"LoadHelp \"Scripts\\Mombot\\{file.Replace(".ts", ".cts")}\"");
                }
                else
                {
                    ecount++;

                    // Update the compile log.
                    clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: Failed to compile.");
                    clog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: {line}.");

                    // Update the error log.
                    if (ecount == 1) elog.WriteLine($"{DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")} Biliding Mombot 5");
                    elog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: Failed to compile.");
                    elog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: {line}.");
                }
            }
            else
            {
                ccount++;
                wcount++;
                // Update the warning log.
                if (wcount == 1) wlog.WriteLine($"{DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss")} Biliding Mombot 5");
                wlog.WriteLine($"{DateTime.Now.ToString("HH:mm:ss")} {cts.Name}: No source file found.");

                // File has no source, so just copy the prevouly compiled script.
                if (dst.Exists) dst.Delete();
                cts.CopyTo(dst.FullName);
            }

            this.Dispatcher.Invoke(() =>
            {
                // Update the progress bar and label.
                ProgressBar.Value = ++Completed;
                ProgressLabel.Content = $"Compiled: {cts.Name}";
            });
        }

        private void onCancelClick(object sender, RoutedEventArgs e)
        {
            // TODO: Cancel all threads.

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
