const TELJES_WPF_KOD = {
  etelCs: `using System;

namespace Etelek
{
    public class Etel
    {
        public string Nev { get; set; } = "";
        public string Kategoria { get; set; } = "";
        public int Ar { get; set; }
        public int Kaloria { get; set; }

        public Etel() { }

        public Etel(string nev, string kategoria, int ar, int kaloria)
        {
            Nev = nev;
            Kategoria = kategoria;
            Ar = ar;
            Kaloria = kaloria;
        }

        public override string ToString()
            => $"{Nev};{Kategoria};{Ar};{Kaloria}";
    }
}
`,
  mainWindowXaml: `<Window x:Class="Etelek.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        mc:Ignorable="d"
        Title="Etelek" Height="520" Width="900"
        WindowStartupLocation="CenterScreen">
    <Grid Margin="12">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="12"/>
            <RowDefinition Height="*"/>
        </Grid.RowDefinitions>

        <Border Background="#141823" BorderBrush="#2A3144" BorderThickness="1" CornerRadius="10" Padding="10">
            <DockPanel LastChildFill="True">
                <StackPanel DockPanel.Dock="Left" Orientation="Horizontal">
                    <Button Content="Megnyitás" Width="110" Margin="0,0,8,0" Click="Megnyitas_Click"/>
                    <TextBox x:Name="SzuroTextBox" Width="220" Margin="0,0,8,0"
                             VerticalContentAlignment="Center"
                             TextChanged="SzuroTextBox_TextChanged"
                             ToolTip="Szűrés név vagy kategória alapján (kis/nagybetű független)"/>
                    <Button Content="Szűrés" Width="90" Margin="0,0,8,0" Click="Szures_Click"/>
                    <Button Content="Visszaállítás" Width="120" Margin="0,0,8,0" Click="Visszaallitas_Click"/>
                </StackPanel>

                <Button DockPanel.Dock="Right" Content="Mentés" Width="100" Click="Mentes_Click"/>
            </DockPanel>
        </Border>

        <DataGrid Grid.Row="2"
                  x:Name="EtelekDataGrid"
                  AutoGenerateColumns="False"
                  IsReadOnly="True"
                  CanUserAddRows="False"
                  HeadersVisibility="Column"
                  GridLinesVisibility="Horizontal"
                  RowBackground="#0B0E14"
                  AlternatingRowBackground="#0F1526"
                  BorderBrush="#2A3144"
                  BorderThickness="1"
                  Margin="0">
            <DataGrid.Columns>
                <DataGridTextColumn Header="Név" Binding="{Binding Nev}" Width="2*"/>
                <DataGridTextColumn Header="Kategória" Binding="{Binding Kategoria}" Width="2*"/>
                <DataGridTextColumn Header="Ár (Ft)" Binding="{Binding Ar}" Width="*"/>
                <DataGridTextColumn Header="Kalória" Binding="{Binding Kaloria}" Width="*"/>
            </DataGrid.Columns>
        </DataGrid>
    </Grid>
</Window>
`,
  mainWindowXamlCs: `using Microsoft.Win32;
using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Data;

namespace Etelek
{
    public partial class MainWindow : Window
    {
        private readonly ObservableCollection<Etel> _etelek = new ObservableCollection<Etel>();
        private readonly ICollectionView _etelekNezet;

        public MainWindow()
        {
            InitializeComponent();

            _etelekNezet = CollectionViewSource.GetDefaultView(_etelek);
            _etelekNezet.Filter = SzuresFeltetel;

            EtelekDataGrid.ItemsSource = _etelekNezet;
        }

        private bool SzuresFeltetel(object objektum)
        {
            if (objektum is not Etel etel) return false;

            string keresett = (SzuroTextBox?.Text ?? "").Trim();
            if (string.IsNullOrWhiteSpace(keresett))
                return true;

            return TartalmazKisNagybetuFuggetlen(etel.Nev, keresett)
                || TartalmazKisNagybetuFuggetlen(etel.Kategoria, keresett);
        }

        private static bool TartalmazKisNagybetuFuggetlen(string szoveg, string resz)
        {
            if (szoveg == null) return false;
            if (resz == null) return true;

            return szoveg.IndexOf(resz, StringComparison.OrdinalIgnoreCase) >= 0;
        }

        private void Megnyitas_Click(object sender, RoutedEventArgs e)
        {
            var megnyitasAblak = new OpenFileDialog
            {
                Title = "Ételek fájl megnyitása",
                Filter = "CSV / szöveg (*.csv;*.txt)|*.csv;*.txt|Minden fájl (*.*)|*.*",
                CheckFileExists = true
            };

            if (megnyitasAblak.ShowDialog() != true) return;

            try
            {
                BetoltesFajlbol(megnyitasAblak.FileName);
                _etelekNezet.Refresh();
                MessageBox.Show("Sikeres betöltés.", "OK", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception kivetel)
            {
                MessageBox.Show(
                    "Hiba történt a beolvasás közben:\n" + kivetel.Message,
                    "Hiba",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        private void BetoltesFajlbol(string fajlUt)
        {
            _etelek.Clear();

            var sorok = File.ReadAllLines(fajlUt);

            foreach (var nyersSor in sorok)
            {
                var sor = (nyersSor ?? "").Trim();
                if (string.IsNullOrWhiteSpace(sor))
                    continue;

                // Várt formátum: Nev;Kategoria;Ar;Kaloria
                var mezok = sor.Split(';');
                if (mezok.Length < 4)
                    throw new FormatException("Hibás sorformátum (kevés mező): " + sor);

                string nev = mezok[0].Trim();
                string kategoria = mezok[1].Trim();

                if (!int.TryParse(mezok[2].Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out int ar))
                    throw new FormatException("Hibás ár érték: " + mezok[2]);

                if (!int.TryParse(mezok[3].Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out int kaloria))
                    throw new FormatException("Hibás kalória érték: " + mezok[3]);

                _etelek.Add(new Etel(nev, kategoria, ar, kaloria));
            }
        }

        private void SzuroTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
        {
            // Gépelés közben is frissül a nézet
            _etelekNezet.Refresh();
        }

        private void Szures_Click(object sender, RoutedEventArgs e)
        {
            _etelekNezet.Refresh();
        }

        private void Visszaallitas_Click(object sender, RoutedEventArgs e)
        {
            SzuroTextBox.Text = "";
            _etelekNezet.Refresh();
        }

        private void Mentes_Click(object sender, RoutedEventArgs e)
        {
            if (!_etelek.Any())
            {
                MessageBox.Show("Nincs mit menteni (üres a lista).", "Figyelem", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var mentesAblak = new SaveFileDialog
            {
                Title = "Mentés fájlba",
                Filter = "CSV (*.csv)|*.csv|Szöveg (*.txt)|*.txt|Minden fájl (*.*)|*.*",
                FileName = "etelek_szurt.csv",
                OverwritePrompt = true
            };

            if (mentesAblak.ShowDialog() != true) return;

            try
            {
                MentesFajlba(mentesAblak.FileName);
                MessageBox.Show("Sikeres mentés.", "OK", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception kivetel)
            {
                MessageBox.Show(
                    "Hiba történt a mentés közben:\n" + kivetel.Message,
                    "Hiba",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
            }
        }

        private void MentesFajlba(string fajlUt)
        {
            // Mentés mindig az aktuálisan megjelenített (szűrt) elemekből történik
            var sorok = _etelekNezet.Cast<Etel>().Select(etel => etel.ToString()).ToArray();
            File.WriteAllLines(fajlUt, sorok);
        }
    }
}
`
};

const TASKS = [
  {
    id: "1",
    title: "1. feladat",
    description:
`Készítsd el a projektet és az alap struktúrát.

- Hozz létre egy WPF projektet 'Etelek' néven.
- A megoldás 3 fájlból áll: Etel.cs (modell), MainWindow.xaml (UI), MainWindow.xaml.cs (logika).
- A felület célja: fájl megnyitása, szűrés, szűrés visszaállítása, mentés.`,
    files: [
      { name: "Etel.cs", hint: "Modell (osztály)", code: TELJES_WPF_KOD.etelCs },
      { name: "MainWindow.xaml", hint: "Felhasználói felület", code: TELJES_WPF_KOD.mainWindowXaml },
      { name: "MainWindow.xaml.cs", hint: "Eseménykezelők és adatkezelés", code: TELJES_WPF_KOD.mainWindowXamlCs }
    ]
  },
  {
    id: "2",
    title: "2. feladat",
    description:
`Készítsd el az Etel modellosztályt.

Elvárások:
- Tulajdonságok: Név, Kategória, Ár, Kalória
- Konstruktor(ok)
- ToString() a mentéshez (CSV-szerű formátum: Nev;Kategoria;Ar;Kaloria)`,
    files: [
      { name: "Etel.cs", hint: "Teljes, működő modell", code: TELJES_WPF_KOD.etelCs },
      { name: "MainWindow.xaml", hint: "Ablak a modell megjelenítéséhez", code: TELJES_WPF_KOD.mainWindowXaml },
      { name: "MainWindow.xaml.cs", hint: "Betöltés + megjelenítés a modellből", code: TELJES_WPF_KOD.mainWindowXamlCs }
    ]
  },
  {
    id: "3",
    title: "3. feladat",
    description:
`Készítsd el a MainWindow felületét (XAML).

Kötelező elemek:
- Gombok: Megnyitás, Szűrés, Visszaállítás, Mentés
- TextBox a keresési/szűrési szöveghez
- DataGrid az ételek megjelenítésére

Tipp:
- AutoGenerateColumns="False" és kézzel definiált oszlopok (Név, Kategória, Ár, Kalória).`,
    files: [
      { name: "MainWindow.xaml", hint: "Teljes UI (gombok + TextBox + DataGrid)", code: TELJES_WPF_KOD.mainWindowXaml },
      { name: "Etel.cs", hint: "A DataGrid ehhez a modellhez köt", code: TELJES_WPF_KOD.etelCs },
      { name: "MainWindow.xaml.cs", hint: "ItemsSource + események", code: TELJES_WPF_KOD.mainWindowXamlCs }
    ]
  },
  {
    id: "4",
    title: "4. feladat",
    description:
`Valósítsd meg a fájl beolvasását OpenFileDialog segítségével.

Elvárások:
- OpenFileDialog használata (Megnyitás gomb)
- Soronkénti beolvasás (CSV vagy txt)
- Hibakezelés (try/catch) és érthető hibaüzenet (MessageBox)
- A beolvasott adatokból Etel objektumok készítése`,
    files: [
      { name: "MainWindow.xaml.cs", hint: "Megnyitás + BetoltesFajlbol + try/catch", code: TELJES_WPF_KOD.mainWindowXamlCs },
      { name: "Etel.cs", hint: "Beolvasott sorokból példányosítva", code: TELJES_WPF_KOD.etelCs },
      { name: "MainWindow.xaml", hint: "Megnyitás gomb Click eseménye", code: TELJES_WPF_KOD.mainWindowXaml }
    ]
  },
  {
    id: "5",
    title: "5. feladat",
    description:
`Használj ObservableCollection-t és kösd a DataGrid-hez.

Elvárások:
- ObservableCollection<Etel> tárolja az ételeket
- DataGrid ItemsSource erre a gyűjteményre (pontosabban egy nézetre) legyen kötve
- Beolvasáskor a lista ürüljön és újratöltődjön`,
    files: [
      { name: "MainWindow.xaml.cs", hint: "ObservableCollection + ICollectionView + ItemsSource", code: TELJES_WPF_KOD.mainWindowXamlCs },
      { name: "MainWindow.xaml", hint: "DataGrid megjelenítés", code: TELJES_WPF_KOD.mainWindowXaml },
      { name: "Etel.cs", hint: "A rekord típusa", code: TELJES_WPF_KOD.etelCs }
    ]
  },
  {
    id: "6",
    title: "6. feladat",
    description:
`Valósítsd meg a szűrést (kis/nagybetű független) és a visszaállítást.

Elvárások:
- TextBox-ba írt keresőkifejezés alapján szűrés
- Szűrés név VAGY kategória mezőben
- Case-insensitive összehasonlítás
- Visszaállítás gomb törli a TextBox-ot és frissíti a nézetet`,
    files: [
      { name: "MainWindow.xaml.cs", hint: "ICollectionView.Filter + Refresh + Visszaállítás", code: TELJES_WPF_KOD.mainWindowXamlCs },
      { name: "MainWindow.xaml", hint: "TextChanged + Szűrés/Visszaállítás gombok", code: TELJES_WPF_KOD.mainWindowXaml },
      { name: "Etel.cs", hint: "Szűréshez használt string mezők", code: TELJES_WPF_KOD.etelCs }
    ]
  },
  {
    id: "7",
    title: "7. feladat",
    description:
`Valósítsd meg a mentést SaveFileDialog segítségével.

Elvárások:
- SaveFileDialog használata (Mentés gomb)
- Mentés az aktuálisan megjelenített (szűrt) elemekből
- Hibakezelés (try/catch) + MessageBox visszajelzés
- Mentés formátuma: Nev;Kategoria;Ar;Kaloria (Etel.ToString())`,
    files: [
      { name: "MainWindow.xaml.cs", hint: "Mentés + MentesFajlba + try/catch", code: TELJES_WPF_KOD.mainWindowXamlCs },
      { name: "Etel.cs", hint: "ToString() adja a sorformátumot", code: TELJES_WPF_KOD.etelCs },
      { name: "MainWindow.xaml", hint: "Mentés gomb Click eseménye", code: TELJES_WPF_KOD.mainWindowXaml }
    ]
  }
];

// JavaScript kizárólag a nézetváltáshoz és egyszerű UI-hoz
const el = (sel) => document.querySelector(sel);

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function listaNezetKirajzolasa() {
  const lista = el("#taskList");
  lista.innerHTML = "";

  TASKS.forEach((f) => {
    const elem = document.createElement("div");
    elem.className = "taskItem";
    elem.setAttribute("role", "listitem");
    elem.tabIndex = 0;

    elem.innerHTML = `
      <div class="taskItem__left">
        <div class="taskItem__title">${escapeHtml(f.title)}</div>
        <div class="taskItem__desc">${escapeHtml(f.description.split("\n")[0])}</div>
      </div>
      <div class="taskItem__chev">→</div>
    `;

    const nyit = () => feladatMegnyitasa(f.id);
    elem.addEventListener("click", nyit);
    elem.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nyit();
      }
    });

    lista.appendChild(elem);
  });

  el("#homeView").classList.remove("hidden");
  el("#detailView").classList.add("hidden");
}

function reszletNezetKirajzolasa(feladat) {
  el("#detailTitle").textContent = feladat.title;
  el("#detailDesc").textContent = feladat.description;

  const doboz = el("#detailFiles");
  doboz.innerHTML = "";

  feladat.files.forEach((fajl) => {
    const kartya = document.createElement("div");
    kartya.className = "fileCard";
    kartya.innerHTML = `
      <div class="fileCard__header">
        <div class="fileName">${escapeHtml(fajl.name)}</div>
        <div class="fileHint">${escapeHtml(fajl.hint || "")}</div>
      </div>
      <pre><code>${escapeHtml(fajl.code)}</code></pre>
    `;
    doboz.appendChild(kartya);
  });

  el("#homeView").classList.add("hidden");
  el("#detailView").classList.remove("hidden");
}

function feladatMegnyitasa(azonosito) {
  const feladat = TASKS.find((x) => x.id === azonosito);
  if (!feladat) {
    listaNezetKirajzolasa();
    return;
  }
  history.pushState({ nezet: "feladat", azonosito }, "", `#${encodeURIComponent(azonosito)}`);
  reszletNezetKirajzolasa(feladat);
}

function vissza() {
  history.pushState({ nezet: "lista" }, "", "#");
  listaNezetKirajzolasa();
}

function urlAlapjanSzinkron() {
  const hash = (location.hash || "").replace(/^#/, "").trim();
  if (!hash) {
    listaNezetKirajzolasa();
    return;
  }
  const azonosito = decodeURIComponent(hash);
  const feladat = TASKS.find((x) => x.id === azonosito);
  if (feladat) reszletNezetKirajzolasa(feladat);
  else listaNezetKirajzolasa();
}

el("#backBtn").addEventListener("click", vissza);
window.addEventListener("popstate", urlAlapjanSzinkron);

urlAlapjanSzinkron();
