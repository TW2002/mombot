using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
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

        public Main()
        {
            InitializeComponent();

            //List<Task> tasks = new List<Task>();

            Path = Environment.CurrentDirectory;
            Path = Path.Replace(@"\bin\Debug", "");
            Path = Path.Replace(@"\bin\Release", "");
            Path = Path.Replace(@"\MakeBot", "");
            //string file = $"{path}\\Installer\\Product.wxs";

            Scripts = new FileList(Path);
            ProgressBar.Maximum = Scripts.Files.Count();




        }

        private void onContentRendered(object sender, EventArgs e)
        {
            List<Task> tasks = new List<Task>();

            ThreadPool.SetMaxThreads(100, 100);

            foreach (var file in Scripts.Files)
            {
                tasks.Add(Task.Run(() => CompileScript(file)));
            }

            Task.Run(() => Task.WhenAll(tasks).Wait()).ContinueWith(t =>
            Dispatcher.Invoke(() =>
            {
                ProgressLabel.Content = $"Completed 87 of 88 with 1 error.";
                ErrorLabel.Visibility = Visibility.Visible;

                Cancel.Visibility = Visibility.Hidden;
                Finish.Visibility = Visibility.Visible;
            }));



        }

        private void CompileScript(string file)
        {
            //Thread.Sleep(1000);

            var f = new FileInfo(file);
            var cts = new FileInfo(file.Replace(".ts", ".cts"));

            if (f.Extension == ".ts")
            {
                if (cts.Exists) cts.Delete();

                //Process.Start("twxc " + f.Name + " > compile.log");
                Process.Start("twxc.exe", f.Name);
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
