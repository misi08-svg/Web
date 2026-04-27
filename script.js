const TELJES_WPF_KOD = {
  dronCs: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WpfDronok.Model
{
    public class Dron
    {
        public string Nev { get; set; }
        public string Tipus { get; set; }
        public int GyartasiEv { get; set; }
        public int MaxSebesseg { get; set; }
        public int AkkuKapacitas { get; set; }
        public int RepulesiIdo { get; set; }

        public Dron(string sor,char hatarolo)
        {
            var adatok = sor.Split(hatarolo);
            Nev = adatok[0];
            Tipus = adatok[1];
            GyartasiEv=Convert.ToInt32(adatok[2]);
            MaxSebesseg=Convert.ToInt32(adatok[3]);
            AkkuKapacitas=Convert.ToInt32(adatok[4]);
            RepulesiIdo=Convert.ToInt32(adatok[5]);
        }
    }
}
`,
  dronListaCs: `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WpfDronok.Model
{
    public class DronLista
    {
        public List<Dron> Dronok { get; set; } = new List<Dron>();

        public DronLista(string fajl,char hatarolo,int start=1)
        {
            var sorok=File.ReadAllLines(fajl,Encoding.Default);

            for(int i = start; i < sorok.Length; i++)
            {
                Dronok.Add(new Dron(sorok[i], hatarolo));
            }
            
        }
    }
}
`,
  mainWindowXamlCs: `using Microsoft.Win32;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using WpfDronok.Model;
using WpfDronok.Views;

namespace WpfDronok;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    public List<Dron> Dronok { get; set; }=new List<Dron>();
    public MainWindow()
    {
        InitializeComponent();
    }

    private void menuitemKilepes_Click(object sender, RoutedEventArgs e)
    {
        Environment.Exit(0);
    }

    private void menuitemNevjegy_Click(object sender, RoutedEventArgs e)
    {
        NevjegyView nevjegy=new NevjegyView();
        nevjegy.ShowDialog();
    }

    private void menuitemMegnyitas_Click(object sender, RoutedEventArgs e)
    {
        OpenFileDialog dialog = new OpenFileDialog();
        dialog.Filter = ".csv fájlok|*.csv|minden fájl|*.*";

        if (dialog.ShowDialog()==true)
        {
            try
            {
                Dronok = new DronLista(dialog.FileName, ',').Dronok;
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);                
            }
        }
    }

    private void menuitemTipusSzures_Click(object sender, RoutedEventArgs e)
    {
        TipusSzuresView tipusSzures = new TipusSzuresView(Dronok);
        tipusSzures.ShowDialog();
    }

    private void menuitemMentes_Click(object sender, RoutedEventArgs e)
    {
        //Nem ebben az ablakban vagyunk.
    }
}
`,
  mainWindowXaml: `<Window x:Class="WpfDronok.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WpfDronok"
        mc:Ignorable="d"
        Title="Drónok" Height="450" Width="800">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="9*"/>
        </Grid.RowDefinitions>
        <Menu FontSize="18">
            <MenuItem Header="Fájl">
                <MenuItem x:Name="menuitemMegnyitas" Header="Megnyitás" Click="menuitemMegnyitas_Click"/>
                <MenuItem x:Name="menuitemMentes" Header="Mentés" Click="menuitemMentes_Click"/>
                <MenuItem Header="Mentés másként" />
                <MenuItem x:Name="menuitemKilepes" Header="Kilépés" Click="menuitemKilepes_Click"/>

            </MenuItem>
            <MenuItem Header="Szerkesztés">
                <MenuItem Header="Kivágás"/>
                <MenuItem Header="Másolás"/>
                <MenuItem Header="Beillesztés"/>
            </MenuItem>
            <MenuItem Header="Adatok">
                <MenuItem x:Name="menuitemTipusSzures" Header="Szűrés típus szerint" Click="menuitemTipusSzures_Click"/>
            </MenuItem>
            <MenuItem Header="Súgó">
                <MenuItem x:Name="menuitemNevjegy" Header="Névjegy" Click="menuitemNevjegy_Click"/>
            </MenuItem>
            
        </Menu>

    </Grid>
</Window>
`,
  tipusSzuresViewXamlCs: `using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using WpfDronok.Model;

namespace WpfDronok.Views
{
    /// <summary>
    /// Interaction logic for TipusSzuresView.xaml
    /// </summary>
    public partial class TipusSzuresView : Window
    {
        public List<Dron> Dronok { get; set; }=new List<Dron>();
        public TipusSzuresView(List<Dron> dronok)
        {
            InitializeComponent();
            Dronok= dronok;
            datagridDronok.ItemsSource = Dronok;
            comboDronok.ItemsSource = Dronok.OrderBy(x=>x.Tipus).Select(x=>x.Tipus).Distinct().ToList();
        }

        private void buttonKeres_Click(object sender, RoutedEventArgs e)
        {
            datagridDronok.ItemsSource = null;

            var keresett = textboxKereses.Text;
            //Megegyzés vizsgálata
            //var eredmeny=Dronok.FindAll(x=>x.Tipus.ToLower()==keresett.ToLower());

            //Tartalmazás vizsgálata
            var eredmeny = Dronok.FindAll(x => x.Tipus.ToLower().Contains(keresett.ToLower()));


            if (eredmeny.Count()>0)
            {
                datagridDronok.ItemsSource= eredmeny;
            } else
            {
                MessageBox.Show("Nincs ilyen adat!");
            }
        }

        private void buttonVissza_Click(object sender, RoutedEventArgs e)
        {
            datagridDronok.ItemsSource = Dronok;
        }

        private void comboDronok_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var kivalasztott=comboDronok.SelectedItem as string;
            var eredmeny = Dronok.FindAll(x => x.Tipus == kivalasztott);

            datagridDronok.ItemsSource=eredmeny;
        }

        private void buttonMentes_Click(object sender, RoutedEventArgs e)
        {
            SaveFileDialog dialog = new SaveFileDialog();
            dialog.Filter = ".csv fájlok|*.csv|.txt fájlok|*.txt";
            //???
            if (dialog.ShowDialog()==true)
            {
                try
                {
                    FileStream fajl = new FileStream(dialog.FileName, FileMode.Create);

                    using (StreamWriter writer = new StreamWriter(fajl, Encoding.UTF8))
                    {
                        writer.WriteLine($"nev;tipus;gyartasiev;maxsebesseg;akkukapacitas;repulesido");

                        foreach (var i in datagridDronok.ItemsSource as List<Dron>)
                        {
                            writer.WriteLine($"{i.Nev};{i.Tipus};{i.GyartasiEv};{i.MaxSebesseg};{i.AkkuKapacitas};{i.RepulesiIdo}");
                        }
                    }
                                                      

                    
                    
                    MessageBox.Show("Fájlba írás kész!");

                    
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message, "Hiba!", MessageBoxButton.OK, MessageBoxImage.Error);                    
                }
            }
        }
    }
}
`,
  tipusSzuresViewXaml: `<Window x:Class="WpfDronok.Views.TipusSzuresView"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WpfDronok.Views"
        mc:Ignorable="d"
        Title="TipusSzuresView" Height="450" Width="800">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="8*"/>
            <RowDefinition Height="2*"/>
        </Grid.RowDefinitions>
        <DataGrid x:Name="datagridDronok" ColumnWidth="*" />
        <WrapPanel Grid.Row="1" HorizontalAlignment="Center" VerticalAlignment="Center">
            <ComboBox x:Name="comboDronok" FontSize="16" SelectionChanged="comboDronok_SelectionChanged"/>
            <Button x:Name="buttonVissza" Content="Vissza" FontSize="16" Margin="10,0,0,0" Click="buttonVissza_Click"/>
            <TextBox x:Name="textboxKereses" FontSize="16" Width="200" Margin="10,0,0,0" />
            <Button x:Name="buttonKeres" Content="Keres" FontSize="16" Margin="10,0,0,0" Click="buttonKeres_Click"/>
            <Button x:Name="buttonMentes" Content="Szűrés mentése" FontSize="16" Margin="10,0,0,0" Click="buttonMentes_Click"/>

        </WrapPanel>

    </Grid>
</Window>
`
};

const CODE_SECTIONS = [
  { file: "DronLista.cs", question: "How to read a CSV file in C#", code: TELJES_WPF_KOD.dronListaCs },
  { file: "TipusSzuresView.xaml", question: "How to use a DataGrid in WPF", code: TELJES_WPF_KOD.tipusSzuresViewXaml },
  { file: "TipusSzuresView.xaml.cs", question: "LINQ filtering on lists (contains / case-insensitive)", code: TELJES_WPF_KOD.tipusSzuresViewXamlCs },
  { file: "MainWindow.xaml.cs", question: "Error handling with try-catch", code: TELJES_WPF_KOD.mainWindowXamlCs },
  { file: "Dron.cs", question: "List vs ObservableCollection (what’s the difference?)", code: TELJES_WPF_KOD.dronCs },
  { file: "MainWindow.xaml", question: "WPF window + menu structure (XAML)", code: TELJES_WPF_KOD.mainWindowXaml }
];

const el = (sel) => document.querySelector(sel);

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCodeBlocks() {
  const box = el("#codeBlocks");
  box.innerHTML = "";

  CODE_SECTIONS.forEach((section) => {
    const details = document.createElement("details");
    details.className = "qaItem";
    details.innerHTML = `
      <summary class="qaSummary">${escapeHtml(section.question)}</summary>
      <div class="qaMeta">File: <span class="qaFile">${escapeHtml(section.file)}</span></div>
      <pre class="codePre"><code>${escapeHtml(section.code)}</code></pre>
    `;
    box.appendChild(details);
  });
}

renderCodeBlocks();
