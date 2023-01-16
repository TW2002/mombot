using MakeMSI;
using System.Diagnostics;

class Test
{
    public static void Main()
    {
        string path = Environment.CurrentDirectory;
        path = path.Replace(@"\bin\Debug\net7.0", "");
        path = path.Replace(@"\bin\Release\net7.0", "");
        path = path.Replace(@"\MakeMSI", "");
        string file = @$"{path}\Installer\Product.wxs";

        FileList fl = new(path);

        using (StreamWriter sw = File.CreateText(file))
        {
            sw.WriteLine("""
                <?xml version="1.0" encoding="UTF-8"?>
                <Wix xmlns="http://schemas.microsoft.com/wix/2006/wi" xmlns:util="http://schemas.microsoft.com/wix/UtilExtension">
                	<Product Id="*" Name="Mombot 5.0" Language="1033" Version="2.6.5.2" Manufacturer="eXide" UpgradeCode="9be0828c-24de-43b2-a233-5c0a82c07f35">
                		<Package InstallerVersion="200" Compressed="yes" InstallScope="perMachine" />
    
                        <MajorUpgrade AllowSameVersionUpgrades="yes"
                            DowngradeErrorMessage="A newer version of [ProductName] is already installed. If you are sure you want to downgrade, remove the existing installation via Programs and Features." />

                        <MediaTemplate EmbedCab="yes" />

                        <Feature Id="ProductFeature" Title="TWX Proxy" Level="1" Absent="disallow" ConfigurableDirectory="MOMBOT" Description="Installs the main TWX Proxy program, including Pack 1 / 2">
                            <ComponentGroupRef Id="ProductComponents" />
                        </Feature>

                		<Property Id="MOMBOT" Secure="yes">
                			<RegistrySearch Id="ApplicationFolderSearch" Type="raw" Root="HKCU" Key="Software\Xide\TWXP" Name="MOMBOT"/>
                		</Property>
                		<Property Id="COMPILE" Secure="yes">
                			<RegistrySearch Id="CompileMombot" Type="raw" Root="HKCU" Key="Software\Xide\TWXP" Name="COMPILE"/>
                		</Property>
                        <Property Id="WIXUI_INSTALLDIR" Value="MOMBOT" />
                		<UIRef Id="WixUI_InstallDir" />
                  
                <UI>
                    
                    <Publish Dialog="ExitDialog" 
                        Control="Finish" 
                        Event="DoAction" 
                        Value="LaunchApplication">NOT Installed</Publish>
                </UI>
                <!--
                <Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOXTEXT" Value="Compile Mind ()ver Matter bot now." />
                  -->
              
                <Property Id="WixShellExecTarget" Value="[#MakeBot.exe]" />
                <CustomAction Id="LaunchApplication" 
                    BinaryKey="WixCA" 
                    DllEntry="WixShellExec"
                    Impersonate="yes" />                        
                </Product>
                 


                   <Fragment>
                        <WixVariable Id="WixUISupportPerUser" Value="0" />
                        <Property Id="ApplicationFolderName" Value="TWXProxy\Scripts\Mombot" />
                        <Property Id="WixAppFolder" Value="WixPerUserFolder" />

                        <WixVariable Id="WixUILicenseRtf" Value="$(var.ProjectDir)\license.rtf" />
                        <WixVariable Id="WixUIBannerBmp" Value="$(var.ProjectDir)\banner.jpg" />
                        <WixVariable Id="WixUIDialogBmp" Value="$(var.ProjectDir)\sidelogo.jpg" />
                        <SetDirectory Id="APPLICATIONFOLDER" Value="[WindowsVolume]" />
                        
                        <Directory Id="TARGETDIR" Name="SourceDir">
                            <Directory Id="ProgramFilesFolder">
                                <Directory Id="APPLICATIONFOLDER" Name="AppFolder">
                                    <Directory Id="TWXPROXY" Name="TWXProxy" >
                                        <Directory Id="SCRIPTS" Name="Scripts" >
                                            <Directory Id="MOMBOT" Name="Mombot">
                                                <Directory Id="Help" Name="Help" />
                                                <Directory Id="Source" Name="Source" >
                """);

            sw.WriteLine(fl.Dirs);
                
            sw.WriteLine("""                
                                                </Directory>
                                            </Directory>
                                        </Directory>
                                    </Directory>
                                </Directory>
                            </Directory>
                        </Directory>	   

                        <ComponentGroup Id="ProductComponents">
                            <Component Id="ProductComponent" Directory="Source" Guid="72a94083-4c7e-4365-aa2e-10d1aa6721c2"  >
                               <!--<RegistryValue Id="InstallPath" Root="HKCU" Key="Software\Xide\TWXP"  Name="Mombot" Type="string" Value="[Mombot]" />
                               <RegistryValue Id="Compile" Root="HKCU" Key="Software\Xide\TWXP"  Name="Compile" Type="integer" Value="[Compile]" />-->
                                               
                               <File Source="..\mombot.ts"/>
                               <File Source="..\Directory Structure.txt"/>
                               <File Source="..\page.wav"/>
                               <File Source="..\StripExample.ts"/>
                               <File Source="..\MakeBot.exe"/>                               
                               <File Source="..\twxc.exe"/>                                          
                            </Component>
                """);

            sw.WriteLine(fl.Files);

            sw.WriteLine("""                
                        </ComponentGroup>
                    </Fragment>
                </Wix>                
                """
            );
        }

        string wixPath = "C:\\Program Files (x86)\\WiX Toolset v3.11\\bin";

        if (!File.Exists($"{wixPath}\\candle.exe"))
        {
            Console.WriteLine("\n\rWix Toolkit v3.x is free amd open source:");
            Console.WriteLine("https://github.com/wixtoolset/wix3/releases/tag/wix3112rtm");

            Console.WriteLine("\n\rPleade install Wix Toolkit v3.x from:");
            Console.WriteLine("https://wixtoolset.org/docs/wix3/");
        }
        else
        {
            string options = @"-dDebug -d""DevEnvDir=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\\"" -dSolutionDir=C:\Projects\TW2002\mombot\ -dSolutionExt=.sln -dSolutionFileName=Mombot.sln -dSolutionName=Mombot -dSolutionPath=C:\Projects\TW2002\mombot\Mombot.sln -dConfiguration=Debug -dOutDir=..\..\Msi\ -dPlatform=x86 -dProjectDir=C:\Projects\TW2002\mombot\source\Installer\ -dProjectExt=.wixproj -dProjectFileName=Installer.wixproj -dProjectName=Installer -dProjectPath=C:\Projects\TW2002\mombot\source\Installer\Installer.wixproj -dTargetDir=C:\Projects\TW2002\mombot\Msi\ -dTargetExt=.msi -dTargetFileName=Mombot5.0-Pre1.msi -dTargetName=Mombot5.0-Pre1 -dTargetPath=C:\Projects\TW2002\mombot\Msi\Mombot5.0-Pre1.msi -out obj\Debug\ -arch x86 -ext ""C:\Program Files (x86)\WiX Toolset v3.11\bin\\WixUtilExtension.dll"" -ext ""C:\Program Files (x86)\WiX Toolset v3.11\bin\\WixUIExtension.dll""";
            Console.WriteLine($"\n\r Candle {options}");
            var proc = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = $"{wixPath}\\Candle.exe",
                    WorkingDirectory = @$"{path}\Installer",
                    Arguments = options,
                    CreateNoWindow = true
                }
            };
            proc.Start();
            proc.WaitForExit();

            options = @"-out C:\Projects\TW2002\mombot\msi\Mombot5.0-Pre1.msi -pdbout C:\Projects\TW2002\mombot\Msi\Mombot5.0-Pre1.wixpdb -cultures:null -ext ""C:\Program Files (x86)\WiX Toolset v3.11\bin\\WixUtilExtension.dll"" -ext ""C:\Program Files (x86)\WiX Toolset v3.11\bin\\WixUIExtension.dll"" -contentsfile obj\Debug\Installer.wixproj.BindContentsFileListnull.txt -outputsfile obj\Debug\Installer.wixproj.BindOutputsFileListnull.txt -builtoutputsfile obj\Debug\Installer.wixproj.BindBuiltOutputsFileListnull.txt -wixprojectfile C:\Projects\TW2002\mombot\source\Installer\Installer.wixproj obj\Debug\Product.wixobj";

            Console.WriteLine($"\n\r Light {options}");
            var proc2 = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = $"{wixPath}\\Light.exe",
                    WorkingDirectory = @$"{path}\Installer",
                    Arguments = options,
                    CreateNoWindow = true
                }
            };

            Console.WriteLine("\n\rBuilding MSI...\n\r");

            proc2.Start();
            proc2.WaitForExit();

            Console.WriteLine("Done. Press <Enter> to exit...\n\r");
        }

         Console.ReadLine();
    }


}