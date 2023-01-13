using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Shapes;
using System.Xml.Linq;
using static System.Net.WebRequestMethods;

namespace MakeBot
{
    public class FileList
    {
        public List<string> Files  { get; private set; }
        public string Root { get; private set; }

        //private StringBuilder fb;

        public FileList(string root)
        {

            Root = root;

            Files = new List<string>();
            Files.Add($"mombot.ts");

            Enumerate();
        }

        private void Enumerate(String path = "")
        {

            try
            {
                foreach (var d in Directory.GetDirectories($"{Root}\\{path}"))
                {
                    var dir = new DirectoryInfo(d);


                    if (!((dir.Name == "Source") || (dir.Name == "MakeMSI") || (dir.Name == "MakeBot") || (dir.Name == "Installer") || (dir.Name == "bot_includes") || (dir.Name == "module_includes")))
                    {
                        foreach (var f in Directory.GetFiles($"{Root}\\{path}\\{dir.Name}"))
                        {
                            var file = new FileInfo(f);
                            if ((file.Extension == ".ts") || (file.Extension == ".cts") && 
                                !System.IO.File.Exists(file.FullName.Replace(".cts", ".ts")))
                            {
                                if (path == "")
                                    Files.Add($"{dir.Name}\\{file.Name}");
                                else
                                    Files.Add($"{path}\\{dir.Name}\\{file.Name}");
                            }
                        }

                        // Recursive call to inumerate sub directories
                        if (path == "")
                            Enumerate($"{dir.Name}");
                        else
                            Enumerate($"{path}\\{dir.Name}");
                    }
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine(ex.Message);
            }
            catch (PathTooLongException ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}
