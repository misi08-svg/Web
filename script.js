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

const FILM_CARD_JSX = `import React from 'react'

const FilmCard = ({ film, torles }) => {
    return (
        <div>
            <article class="bg-white border border-purple-200 rounded-lg shadow-md overflow-hidden flex flex-col">
                <img src="" alt="Film" class="w-full h-40 object-cover bg-purple-100" />
                <div class="p-4 flex-1 flex flex-col gap-2">
                    <h2 class="text-xl font-semibold text-purple-900">{film.fcim}</h2>
                    <p class="text-purple-700"><span class="font-medium">Rendező:</span>{film.rendezo}</p>
                    <p class="text-purple-700"><span class="font-medium">Év:</span>{film.gyartasi_ev}</p>
                    <p class="text-purple-700"><span class="font-medium">Műfaj:</span> {film.mufaj}</p>
                    <p class="text-purple-700"><span class="font-medium">Jegypont:</span>{film.jegypont} /10</p>
                    <button onClick={() => torles(film.fazon)} type="button" class="mt-auto bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded">
                        Törlés
                    </button>
                </div>
            </article>
        </div>
    )
}

export default FilmCard`;

const FILMEK_JSX = `import React from 'react'
import { useEffect, useState } from 'react'
import axios from "axios"
import FilmCard from "../components/FilmCard"

const Filmek = () => {

    const [filmek, setFilmek] = useState([])
    const api = import.meta.env.VITE_API_URL
    const [torolt, setTorolt] = useState(null)

    const GetFilmek = async () => {
        try {
            const response = await axios.get(\`\${api}/filmek\`)
            setFilmek(response.data)
        } catch (error) {
            console.log(error.message)
        }
    }

    const Torles = async (id) => {
        try {
            await axios.delete(\`\${api}/film/\${id}\`)

        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(() => {
        GetFilmek();
    }, [])


    return (
        <div>
            {filmek.map(film => (
                <FilmCard key={film.fazon} film={film} torles={Torles} />
            ))}
        </div>
    )
}

export default Filmek`;

const FILM_FORM_JSX = `import React from 'react'
import { useEffect, useState } from 'react'
import axios from "axios"

const FilmForm = () => {
    const api = import.meta.env.VITE_API_URL

    const [form, setForm] = useState({
        fazon: "",
        fcim: "",
        rendezo: "",
        gyartasi_ev: "",
        mufaj: "",
        jegypont: ""
    });

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const FilmHozzaadasa = async (e) => {
        e.preventDefault();
        await axios.post(\`\${api}/filmek\`, form);
    };



    return (
        <div><section class="max-w-xl mx-auto bg-white border border-purple-200 rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold text-purple-900 mb-6">Új film felvitele</h2>
            <form onSubmit={FilmHozzaadasa} className="flex flex-col gap-4">
                <label class="flex flex-col gap-1 text-purple-800">
                    Azonosító (fazon)
                    <input name="fazon" value={form.fazon} onChange={handleChange} />
                </label>
                <label class="flex flex-col gap-1 text-purple-800">
                    Cím
                    <input name="fcim" value={form.fcim} onChange={handleChange} />
                </label>
                <label class="flex flex-col gap-1 text-purple-800">
                    Rendező
                    <input name="rendezo" value={form.rendezo} onChange={handleChange} />
                </label>
                <label class="flex flex-col gap-1 text-purple-800">
                    Gyártási év
                    <input name="gyartasi_ev" value={form.gyartasi_ev} onChange={handleChange} />
                </label>
                <label class="flex flex-col gap-1 text-purple-800">
                    Műfaj
                    <input name="mufaj" value={form.mufaj} onChange={handleChange} />
                </label>
                <label class="flex flex-col gap-1 text-purple-800">
                    Jegypont (1–10)
                    <input type='number' name="jegypont" value={form.jegypont} onChange={handleChange} />
                </label>
                <button type="submit" class="bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded mt-2">
                    Mentés
                </button>
            </form>
        </section>
        </div>
    )
}

export default FilmForm`;

const MAIN_COMPONENT_JSX = `import React from 'react'
import Cinema from "../Assets/cinema.svg"

const Main = () => {
    return (
        <div><header class="bg-purple-800 text-white py-10 px-6 text-center shadow-lg">
            <img src={Cinema} alt="Mozihálózat" class="w-20 h-20 mx-auto mb-4" />
            <h1 class="text-3xl font-bold mb-2">Mozihálózat 2025</h1>
            <p class="text-purple-200 text-lg">Vetítési adatok nyilvántartása</p>
        </header>
        </div>
    )
}

export default Main`;

const MENU_JSX = `import React from 'react'
import { Link } from 'react-router-dom'

const Menu = () => {
    return (
        <div>
            <nav class="relative bg-gray-800/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
                <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div class="relative flex h-16 items-center justify-between">
                        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            <button type="button" command="--toggle" commandfor="mobile-menu" class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                                <span class="absolute -inset-0.5"></span>
                                <span class="sr-only">Open main menu</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 in-aria-expanded:hidden">
                                    <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 not-in-aria-expanded:hidden">
                                    <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                            <div class="hidden sm:ml-6 sm:block">
                                <div class="flex space-x-4">

                                    <Link to="/filmek" aria-current="page" class="rounded-md bg-gray-950/50 px-3 py-2 text-sm font-medium text-white">Filmek</Link>
                                    <a href="#" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Vetítések</a>
                                    <Link to="/filmform" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white">Új film</Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Menu`;

const MAIN_JSX = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Menu from "./components/Menu.jsx"
import Main from "./components/Main.jsx"
import Filmek from './components/Filmek.jsx';
import FilmForm from './components/FilmForm.jsx';

const Layout = () => {
return (
<>
<Menu />
<main>
<Outlet />
</main>
</>
)
}

const router = createBrowserRouter([
{
path: "/",
element: <Layout />,
children: [
{
index: true,
element: <Main />
},
{
path: "/filmek",
element: <Filmek />
},
{
path: "/filmform",
element: <FilmForm />
},
{
path: "*",
element: <Main />
}
]
}
])

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<RouterProvider router={router} />
</React.StrictMode>
);`;

const BACKEND_INDEX_JS = `const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const app = express();
app.use(express.json());

// TODO 1: CORS engedélyezése (cors csomag)
app.use(cors());
// TODO 3: mozihalo.db adatbázis használata
const db = new Database("mozihalo.db");

// TODO 5: GET / – üdvözlő JSON üzenet
app.get("/", (req, res) => {
  return res.json({ message: "Üdvözöljük!" });
});
// TODO 6: GET /filmek
app.get("/filmek", (req, res) => {
  try {
    const filmek = db.prepare("SELECT * FROM filmek").all();
    res.json(filmek);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// TODO 7: GET /vetites/:vazon (JOIN: fcim, mnev, varos)
app.get("/vetites/:vazon", (req, res) => {
  try {
    const { vazon } = req.params;

    const vetites = db
      .prepare(
        "select * from vetitesek v join filmek f on v.fazon = f.fazon join mozik m on v.mazon = m.mazon where v.vazon = ?",
      )
      .get(Number(vazon));

    return res.json(vetites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
// TODO 8: POST /filmek
app.post("/filmek", (req, res) => {
  /*
  {
  "fazon": 6,
  "fcim": "test",
  "rendezo": "test",
  "gyartasi_ev": 2000,
  "mufaj": "test",
  "jegypont": 2000
} */
  try {
    const { fazon, fcim, rendezo, gyartasi_ev, mufaj, jegypont } = req.body;

    const insert = db.prepare(\`
      INSERT INTO filmek (fcim, rendezo, gyartasi_ev, mufaj, jegypont)
      VALUES (@fcim, @rendezo, @gyartasi_ev, @mufaj, @jegypont)
    \`);

    const result = insert.run({
      fazon: Number(fazon),
      fcim,
      rendezo,
      gyartasi_ev: Number(gyartasi_ev),
      mufaj,
      jegypont: Number(jegypont),
    });

    return res.status(201).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
// TODO 9: DELETE /film/:fazon
app.delete("/film/:fazon", (req, res) => {
  try {
    const { fazon } = req.params;

    const deleted_film = db.prepare("delete from filmek where fazon = ?");
    deleted_film.run(Number(fazon));

    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
// TODO 10: POST /mozik
app.post("/mozik", (req, res) => {
  try {
    const { mazon, mnev, varos, termek_szama } = req.body;

    const insert = db.prepare(\`
      INSERT INTO mozik (mazon, mnev, varos, termek_szama )
      VALUES (@mazon, @mnev, @varos, @termek_szama)
    \`);

    const result = insert.run({
      mazon: Number(mazon),
      mnev,
      varos,
      termek_szama: Number(termek_szama),
    });

    return res.status(201).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
// TODO 11: PATCH /vetites/:vazon
app.patch("/vetites/:vazon", (req, res) => {
  /*  {
 "jegyar" : 5000000000,
 "szabad_helyek":500000000000, 
 "vetites_ideje": "2025-05-22 19:00"
} */
  try {
    const { vazon } = req.params;
    const { jegyar, szabad_helyek, vetites_ideje } = req.body;

    const eredeti_vetites = db
      .prepare("SELECT * FROM vetitesek WHERE vazon = ?")
      .get(Number(vazon));

    const update_data = db.prepare(\`
      UPDATE vetitesek
      SET jegyar = ?,
          szabad_helyek = ?,
          vetites_ideje = ?
      WHERE vazon = ?
    \`);

    update_data.run(
      jegyar ?? eredeti_vetites.jegyar,
      szabad_helyek ?? eredeti_vetites.szabad_helyek,
      vetites_ideje ?? eredeti_vetites.vetites_ideje,
      Number(vazon),
    );

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// TODO 2: 8000-es port
const PORT = 8000;
app.listen(PORT, () => {
  console.log(\`Szerver fut: http://localhost:\${PORT}\`);
});
`;

const BACKEND_SECTIONS = [
  { file: "index.js", code: BACKEND_INDEX_JS }
];

const WPF_SECTIONS = [
  { file: "DronLista.cs", question: "How to read a CSV file in C#", code: TELJES_WPF_KOD.dronListaCs },
  { file: "TipusSzuresView.xaml", question: "How to use a DataGrid in WPF", code: TELJES_WPF_KOD.tipusSzuresViewXaml },
  { file: "TipusSzuresView.xaml.cs", question: "LINQ filtering on lists (contains / case-insensitive)", code: TELJES_WPF_KOD.tipusSzuresViewXamlCs },
  { file: "MainWindow.xaml.cs", question: "Error handling with try-catch", code: TELJES_WPF_KOD.mainWindowXamlCs },
  { file: "Dron.cs", question: "List vs ObservableCollection (what’s the difference?)", code: TELJES_WPF_KOD.dronCs },
  { file: "MainWindow.xaml", question: "WPF window + menu structure (XAML)", code: TELJES_WPF_KOD.mainWindowXaml }
];

const FRONTEND_SECTIONS = [
  { file: "FilmCard.jsx", code: FILM_CARD_JSX },
  { file: "Filmek.jsx", code: FILMEK_JSX },
  { file: "FilmForm.jsx", code: FILM_FORM_JSX },
  { file: "Main.jsx", code: MAIN_COMPONENT_JSX },
  { file: "Menu.jsx", code: MENU_JSX },
  { file: "main.jsx", code: MAIN_JSX }
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

function createQaItem(section, fileAsTitle) {
  const details = document.createElement("details");
  details.className = fileAsTitle ? "qaItem qaItem--file" : "qaItem";
  const title = fileAsTitle ? section.file : section.question;
  const meta = fileAsTitle
    ? ""
    : `<div class="qaMeta">File: <span class="qaFile">${escapeHtml(section.file)}</span></div>`;
  details.innerHTML = `
    <summary class="qaSummary">${escapeHtml(title)}</summary>
    ${meta}
    <pre class="codePre"><code>${escapeHtml(section.code)}</code></pre>
  `;
  return details;
}

function renderGroup(box, title, ariaLabel, sections, fileAsTitle) {
  const group = document.createElement("section");
  group.className = "qaGroup";
  group.setAttribute("aria-label", ariaLabel);
  group.innerHTML = `<h2 class="qaGroup__title">${escapeHtml(title)}</h2>`;

  const list = document.createElement("div");
  list.className = "qa";
  sections.forEach((section) => {
    list.appendChild(createQaItem(section, fileAsTitle));
  });
  group.appendChild(list);
  box.appendChild(group);
}

function renderCodeBlocks() {
  const box = el("#codeBlocks");
  box.innerHTML = "";

  const wpfList = document.createElement("div");
  wpfList.className = "qa";
  WPF_SECTIONS.forEach((section) => {
    wpfList.appendChild(createQaItem(section, false));
  });
  box.appendChild(wpfList);

  renderGroup(box, "Frontend", "Frontend", FRONTEND_SECTIONS, true);
  renderGroup(box, "Backend", "Backend", BACKEND_SECTIONS, true);
}

renderCodeBlocks();
