using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace MakeMSI
{
    public class FileList
    {
        public int DirIndex { get; private set; }
        public int FileIndex { get; private set; }
        public string Dirs { get; private set; }
        public string Files { get; private set; }
        public string Root { get; private set; }

        private StringBuilder db;
        private StringBuilder fb;

        public FileList(string root)
        {
            DirIndex = -1;
            FileIndex = 0;
            Dirs = "";
            Files = "";
            Root = root;

            db = new();
            fb = new();

            Enumerate();
            EnumerateHelp();

            Dirs = db.ToString();
            Files = fb.ToString();
        }

        private void Enumerate(String path = "")
        {

            try
            {
                foreach (var d in System.IO.Directory.GetDirectories(@$"{Root}\{path}"))
                {
                    var dir = new DirectoryInfo(d);


                    //if (!(((dir.Name == "Help") || (dir.Name == "MakeMSI") || (dir.Name == "MakeBot") || (dir.Name == "Installer"))))
                    if (!(((dir.Name == "Startups") || (dir.Name == "MakeMSI") || (dir.Name == "MakeBot") || (dir.Name == "Installer") || (dir.Name == "help") || (dir.Name == "Debug"))))
                    {
                        DirIndex++;
                        Console.WriteLine(@$"D{DirIndex:D4}:{path}\{dir.Name}");

                        db.AppendLine($"<Directory Id=\"D{DirIndex:D4}\" Name=\"{dir.Name}\">");

                        int fileCount = 0;
                        foreach (var f in Directory.GetFiles(@$"{Root}\{path}\{dir.Name}"))
                        {
                            var file = new FileInfo(f);
                            if (((file.Extension == ".ts") || (file.Extension == ".wav") || (file.Extension == ".txt") ||
                               (file.Extension == ".cts") && !File.Exists(file.FullName.Replace(".cts", ".ts"))) &&
                               file.Name != "Directory Structure.txt")
                            {
                                fileCount++;
                            }
                        }

                        if (fileCount > 0)
                        {
                            fb.AppendLine($"<Component Id=\"C{DirIndex:D4}\" Directory=\"D{DirIndex:D4}\" Guid=\"{Guid.NewGuid()}\">");
                            foreach (var f in Directory.GetFiles(@$"{Root}\{path}\{dir.Name}"))
                            {
                                var file = new FileInfo(f);
                                if (((file.Extension == ".ts") || (file.Extension == ".wav") || (file.Extension == ".txt") ||
                                   (file.Extension == ".cts") && !File.Exists(file.FullName.Replace(".cts", ".ts"))) &&
                                   file.Name != "Directory Structure.txt")
                                {
                                    //Console.WriteLine(@$"D{Index:D4}:{path}\{dir.Name}\{file.Name}");

                                    //fb.AppendLine($"    <File Id=\"F{FileIndex:D4}\" Source=\"{file.FullName}\"/>");
                                    fb.AppendLine($"    <File Id=\"F{FileIndex:D4}\" Source=\"..{path}\\{dir.Name}\\{file.Name}\"/>");
                                    FileIndex++;
                                }
                            }
                            fb.AppendLine($"</Component>");
                        }

                        // Recursive call to inumerate sub directories
                        Enumerate(@$"{path}\{dir.Name}");

                        db.AppendLine($"</Directory>");
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

        private void EnumerateHelp()
        {
            try
            {
                var dir = new DirectoryInfo(@$"{Root}\Help");

                Console.WriteLine(@$"\n\nEnumerating Help Files.\n\r");

                fb.AppendLine($"<Component Id=\"HelpComp\" Directory=\"Help\" Guid=\"{Guid.NewGuid()}\">");

                foreach (var f in Directory.GetFiles(@$"{Root}\Help"))
                {

                    var file = new FileInfo(f);
                    if (file.Extension == ".txt")
                    {
                        fb.AppendLine($"    <File Id=\"F{FileIndex:D4}\" Source=\"..\\Help\\{file.Name}\"/>");
                        FileIndex++;
                    }
                }
                fb.AppendLine($"</Component>");
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
