using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Shapes;
using System.Xml.Linq;
using System.Xml.Xsl;
using static System.Net.WebRequestMethods;

namespace MakeBot
{
    public class FileList
    {
        public List<string> Files  { get; private set; }
        public string Root { get; private set; }

        //private StringBuilder fb;

        /// <summary>
        /// Constructor for FileList file Enumerator
        /// </summary>
        /// <param name="root">Files will be enumerated starting with this path.</param>
        /// <param name="args">Command line arguments passed from Main window.</param>
        public FileList(string root, List<string> args)
        {
            Root = root;

            // Initialzse the file list
            // , and add the main bot.
            Files = new List<string>();

            if (args.Count == 0) args.Add("ALL");

            foreach (var arg in args)
            {
                switch (arg.ToUpper())
                {
                    case "ALL":
                        //Files.Add($"mombot.ts");
                        Enumerate();
                        break;

                    case "BOT":
                        Files.Add($"mombot.ts");
                        //Enumerate();
                        break;

                    default:
                        Enumerate(arg);
                        break;
                }
            }
        }

        /// <summary>
        /// Enumerates all file under the Root path.
        /// </summary>
        /// <param name="path">Used to recursively enumerate sub directories.</param>
        /// <param name="search">Search all subdirectories for this file.</param>
        private void Enumerate(string path = "", string search = "*.*")
        {
            try
            {
                // Replace  all files wildcard with all source scripts.
                if (path.Contains(".*")) path = path.Replace(".*", ".ts");

                // Check to see if path is a single file.
                if (path.Contains(".ts"))
                {
                    search = path;
                    path = "";
                }

                    var dir = new DirectoryInfo($"{Root}\\{path}");

                    // Avoid folders containing include files.
                    if (!(((dir.Name == "MakeMSI") || (dir.Name == "MakeBot") || (dir.Name == "Installer") || (dir.Name == "bot_includes") || (dir.Name == "module_includes"))))
                    {
                    // Loop through each file.
                    foreach (var f in Directory.GetFiles($"{Root}\\{path}", search))
                    {
                            var file = new FileInfo(f);

                        // Check to see if file is a script (.ts) or compiled script (.cts) without a source file.
                        if (((file.Extension == ".ts") || (file.Extension == ".cts" &&
                            !System.IO.File.Exists(file.FullName.Replace(".cts", ".ts")))) &&
                            file.Name != "StripExample.ts")
                            {
                                Files.Add($"{(path==""?"":path + "\\")}{file.Name}");
                            }
                        }

                    // Loop through each directory.
                    foreach (var d in Directory.GetDirectories($"{Root}\\{path}"))
                    {
                        var next = new DirectoryInfo(d);

                        // Recursive call to inumerate sub directories
                        Enumerate($"{(path == "" ? "" : path + "\\")}{next.Name}", search);
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
