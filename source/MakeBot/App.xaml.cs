﻿using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace MakeBot
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {

        private void AppStartup(object sender, StartupEventArgs e)
        {
            Main wnd = new Main(e.Args);
            wnd.Show();
        }
    }
}
