using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using static System.Net.WebRequestMethods;

namespace MakeBot
{
    public class FileList
    {
        public int DirIndex { get; private set; }
        public int FileIndex { get; private set; }
        public List<string> Files  { get; private set; }
        public string Root { get; private set; }

        //private StringBuilder fb;

        public FileList(string root)
        {
            DirIndex = -1;
            FileIndex = 0;
           //Files = "";
            Root = root;

            //fb = new StringBuilder();
            Files = new List<string>();


            Enumerate();

            //Files = fb.ToString();
        }

        private void Enumerate(String path = "")
        {
            Files.Add($"..{path}\\mombot.ts");

            try
            {
                foreach (var d in Directory.GetDirectories($"{Root}\\{path}"))
                {
                    var dir = new DirectoryInfo(d);


                    if (!((dir.Name == "MakeMSI") || (dir.Name == "MakeBot") || (dir.Name == "Installer") || (dir.Name == "bot_includes") || (dir.Name == "module_includes")))
                    {
                        DirIndex++;
                        Console.WriteLine($"D{DirIndex:D4}:{path}\\{dir.Name}");


                        foreach (var f in Directory.GetFiles($"{Root}\\{path}\\{dir.Name}"))
                        {
                            var file = new FileInfo(f);
                            if ((file.Extension == ".ts") || (file.Extension == ".cts") && 
                                !System.IO.File.Exists(file.FullName.Replace(".cts", ".ts")))
                            {
                                Files.Add($"..{path}\\{dir.Name}\\{file.Name}");
                                FileIndex++;
                            }
                        }

                        // Recursive call to inumerate sub directories
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
