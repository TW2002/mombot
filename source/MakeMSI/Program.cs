using System;
using System.IO;
using static System.Net.Mime.MediaTypeNames;

class Test
{
    public static void Main()
    {
        
        string path = Environment.CurrentDirectory;
        path = path.Replace(@"\bin\Debug\net7.0", "");
        path = path.Replace(@"\bin\Release\net7.0", "");
        path = path.Replace(@"\MakeMSI", "");
        string file = @$"{path}\Installer\Product.wxs";

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
                		<Property Id="WIXUI_INSTALLDIR" Value="MOMBOT" />
                		<UIRef Id="WixUI_InstallDir" />
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

                                <Directory Id="Source" Name="Source" >

                                </Directory>
               

                  <!--      <Component Id="ProductComponent">
                            <RegistryValue Id="InstallPath" Root="HKCU" Key="Software\Xide\TWXP"  Name="Mombot" Type="string" Value="[Mombot]" />
                        </Component>-->
                                            </Directory>
                                        </Directory>
                                    </Directory>
                                </Directory>
                            </Directory>
                        </Directory>	   


                        <ComponentGroup Id="ProductComponents">
                            <Component Id="ProductComponent" Directory="Source" Guid="72a94083-4c7e-4365-aa2e-10d1aa6721c2"  >
                               <RegistryValue Id="InstallPath" Root="HKCU" Key="Software\Xide\TWXP"  Name="Mombot" Type="string" Value="[Mombot]" />
                               <File Source="..\mombot.ts"/>
                            </Component>
                        </ComponentGroup>
                                

                    </Fragment>
                </Wix>                
                """);
        }



        if (!File.Exists(path))
        {
            // Create a file to write to.
        }

        //Console.ReadLine();
    }
}