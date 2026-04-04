import type { SupportedLanguage } from "@/lib/site";

type Localized<T> = Record<SupportedLanguage, T>;

export interface CountryDetailContent {
  leader: string;
  nationalMilestone: string;
  capitalAltitudeMeters: number | null;
  summary: string;
  keyFacts: string[];
  seasons: string;
  predominantClimate: string;
  touristSpots: string[];
  religion: string;
  culture: string;
  customs: string;
}

const TOURIST_SPOTS = {
  br: [
    "Cristo Redentor",
    "Lençóis Maranhenses",
    "Cataratas do Iguaçu",
    "Pantanal",
    "Centro histórico de Salvador",
  ],
  us: ["New York", "Grand Canyon", "Washington, D.C.", "Yosemite", "Hawaii"],
  gb: [
    "Palácio de Buckingham",
    "Tower of London",
    "British Museum",
    "Stonehenge",
    "Edimburgo",
  ],
  fr: [
    "Tour Eiffel",
    "Musée du Louvre",
    "Côte d'Azur",
    "Mont Saint-Michel",
    "Vale do Loire",
  ],
  de: [
    "Portão de Brandemburgo",
    "Catedral de Colônia",
    "Castelos da Baviera",
    "Floresta Negra",
    "Museumsinsel",
  ],
  ch: ["Matterhorn", "Lago Léman", "Interlaken", "Lucerna", "Jungfraujoch"],
  jp: ["Monte Fuji", "Quioto", "Tóquio", "Osaka", "Nara"],
  hk: ["Victoria Peak", "Star Ferry", "Tsim Sha Tsui", "Lantau", "Mong Kok"],
  cn: [
    "Grande Muralha",
    "Cidade Proibida",
    "Xangai",
    "Guilin",
    "Exército de Terracota",
  ],
  in: ["Taj Mahal", "Jaipur", "Kerala", "Varanasi", "Mumbai"],
  ca: ["Niagara", "Banff", "Vancouver", "Quebec", "Toronto"],
  au: [
    "Sydney Opera House",
    "Grande Barreira de Corais",
    "Melbourne",
    "Uluru",
    "Gold Coast",
  ],
  sg: [
    "Marina Bay",
    "Gardens by the Bay",
    "Sentosa",
    "Chinatown",
    "Little India",
  ],
} satisfies Partial<Record<string, string[]>>;

const COUNTRY_DETAILS: Record<
  string,
  Localized<CountryDetailContent>
> = {} as Record<string, Localized<CountryDetailContent>>;

Object.assign(COUNTRY_DETAILS, {
  br: {
    pt: {
      leader: "Presidente: Luiz Inácio Lula da Silva",
      nationalMilestone: "Independência em 7 de setembro de 1822.",
      capitalAltitudeMeters: 1172,
      summary:
        "O Brasil reúne dimensões continentais, grande diversidade regional e uma economia que combina agronegócio, indústria, serviços e mercado financeiro concentrado em São Paulo.",
      keyFacts: [
        "Maior país da América do Sul em território e população.",
        "Abriga a maior parte da Floresta Amazônica.",
        "Opera com fusos relevantes entre Sudeste, Amazônia e Acre.",
        "É grande exportador de soja, café, açúcar e proteína animal.",
        "Brasília foi planejada para ser a capital federal moderna.",
      ],
      seasons:
        "Como está majoritariamente no hemisfério sul, o verão vai de dezembro a março e o inverno de junho a setembro.",
      predominantClimate:
        "Predomina o clima tropical, com faixas equatoriais na Amazônia, semiáridas no Nordeste e subtropicais no Sul.",
      touristSpots: TOURIST_SPOTS.br,
      religion:
        "Predominância histórica do cristianismo, com forte diversidade religiosa contemporânea.",
      culture:
        "Música popular, culinária regional, futebol, festas populares e grande diversidade urbana moldam a identidade brasileira.",
      customs:
        "Hospitalidade, refeições em grupo, encontros presenciais e forte valorização de datas festivas são hábitos recorrentes.",
    },
    en: {
      leader: "President: Luiz Inácio Lula da Silva",
      nationalMilestone: "Independence on September 7, 1822.",
      capitalAltitudeMeters: 1172,
      summary:
        "Brazil combines continental scale, strong regional diversity and an economy shaped by agribusiness, industry, services and a financial market centered in Sao Paulo.",
      keyFacts: [
        "Largest country in South America by territory and population.",
        "Holds most of the Amazon rainforest.",
        "Uses multiple relevant timezones across the country.",
        "A major exporter of soy, coffee, sugar and animal protein.",
        "Brasilia was planned as a modern federal capital.",
      ],
      seasons:
        "Because most of the country is in the southern hemisphere, summer runs from December to March and winter from June to September.",
      predominantClimate:
        "Mostly tropical, with equatorial areas in the Amazon, semi-arid zones in the Northeast and subtropical weather in the South.",
      touristSpots: TOURIST_SPOTS.br,
      religion:
        "Historically Christian, with broad contemporary religious diversity.",
      culture:
        "Popular music, regional cuisine, football and large public celebrations shape Brazilian identity.",
      customs:
        "Hospitality, shared meals, face-to-face gatherings and strong attention to festive dates are common habits.",
    },
    es: {
      leader: "Presidente: Luiz Inácio Lula da Silva",
      nationalMilestone: "Independencia el 7 de septiembre de 1822.",
      capitalAltitudeMeters: 1172,
      summary:
        "Brasil combina escala continental, gran diversidad regional y una economía apoyada en agronegocio, industria, servicios y mercado financiero concentrado en São Paulo.",
      keyFacts: [
        "Es el país más grande de América del Sur por territorio y población.",
        "Concentra la mayor parte de la Amazonia.",
        "Opera con husos relevantes entre Sudeste, Amazonia y Acre.",
        "Es gran exportador de soja, café, azúcar y proteína animal.",
        "Brasilia fue planificada como capital federal moderna.",
      ],
      seasons:
        "Al estar mayormente en el hemisferio sur, el verano va de diciembre a marzo y el invierno de junio a septiembre.",
      predominantClimate:
        "Predomina el clima tropical, con zonas ecuatoriales en la Amazonia, semiáridas en el Nordeste y subtropicales en el Sur.",
      touristSpots: TOURIST_SPOTS.br,
      religion:
        "Predominio histórico del cristianismo, con fuerte diversidad religiosa contemporánea.",
      culture:
        "La música popular, la cocina regional, el fútbol y las fiestas colectivas marcan la identidad brasileña.",
      customs:
        "Hospitalidad, comidas compartidas, encuentros presenciales y fuerte valoración de fechas festivas son hábitos frecuentes.",
    },
  },
  us: {
    pt: {
      leader: "Presidente: Donald J. Trump",
      nationalMilestone: "Declaração de Independência em 4 de julho de 1776.",
      capitalAltitudeMeters: 7,
      summary:
        "Os Estados Unidos concentram centros financeiros, tecnológicos e acadêmicos de alcance global, além de uma malha de fusos extensa entre costa leste, centro, montanhas, costa oeste e territórios insulares.",
      keyFacts: [
        "Nova York abriga as maiores bolsas do mundo.",
        "O país combina polos industriais, tecnologia e defesa.",
        "Washington, D.C. é distrito federal e não um estado.",
        "O dólar segue como principal moeda de reserva global.",
        "Mercados financeiros têm janelas pré e pós-negociação muito acompanhadas.",
      ],
      seasons:
        "No território continental, as quatro estações do hemisfério norte são bem marcadas.",
      predominantClimate:
        "Vai de continental temperado a árido, subtropical, alpino e polar, dependendo da região.",
      touristSpots: TOURIST_SPOTS.us,
      religion:
        "Pluralidade religiosa com forte presença histórica do cristianismo e crescimento de pessoas sem afiliação formal.",
      culture:
        "Cinema, música, esportes, inovação e diversidade étnica moldam a cultura norte-americana.",
      customs:
        "Pontualidade, gorjetas em serviços, comunicação direta e forte cultura de agenda são hábitos comuns.",
    },
    en: {
      leader: "President: Donald J. Trump",
      nationalMilestone: "Declaration of Independence on July 4, 1776.",
      capitalAltitudeMeters: 7,
      summary:
        "The United States combines global financial, technology and academic hubs with a broad timezone network across the East Coast, Central states, Mountain region and Pacific coast.",
      keyFacts: [
        "New York hosts the world's largest exchanges.",
        "The economy combines industry, technology, defense and services.",
        "Washington, D.C. is a federal district, not a state.",
        "The US dollar remains the main global reserve currency.",
        "Financial markets have heavily watched pre-market and after-hours windows.",
      ],
      seasons:
        "Across the continental US, the four northern-hemisphere seasons are clearly marked.",
      predominantClimate:
        "The country ranges from temperate continental to arid, subtropical, alpine and polar climates.",
      touristSpots: TOURIST_SPOTS.us,
      religion:
        "Religious pluralism remains strong, with a historical Christian majority and growth in people without formal affiliation.",
      culture:
        "Film, music, sports, entrepreneurship and innovation shape American culture alongside strong regional diversity.",
      customs:
        "Punctuality, tipping in services, direct communication and calendar-driven routines are common habits.",
    },
    es: {
      leader: "Presidente: Donald J. Trump",
      nationalMilestone: "Declaración de Independencia el 4 de julio de 1776.",
      capitalAltitudeMeters: 7,
      summary:
        "Estados Unidos concentra polos financieros, tecnológicos y académicos de escala global, además de una red amplia de husos entre la costa este, el centro, la montaña y la costa oeste.",
      keyFacts: [
        "Nueva York alberga las mayores bolsas del mundo.",
        "La economía combina industria, tecnología, defensa y servicios.",
        "Washington, D. C. es un distrito federal y no un estado.",
        "El dólar sigue siendo la principal moneda de reserva global.",
        "Los mercados financieros tienen franjas de preapertura y postcierre muy observadas.",
      ],
      seasons:
        "En el territorio continental, las cuatro estaciones del hemisferio norte están bien marcadas.",
      predominantClimate:
        "Va de continental templado a árido, subtropical, alpino y polar, según la región.",
      touristSpots: TOURIST_SPOTS.us,
      religion:
        "Pluralidad religiosa con fuerte presencia histórica del cristianismo y aumento de personas sin afiliación formal.",
      culture:
        "Cine, música, deportes, emprendimiento e innovación marcan la cultura estadounidense junto con una gran diversidad regional.",
      customs:
        "Puntualidad, propinas en servicios, comunicación directa y fuerte cultura de agenda son hábitos comunes.",
    },
  },
  gb: {
    pt: {
      leader: "Primeiro-ministro: Keir Starmer",
      nationalMilestone:
        "União política consolidada progressivamente entre 1707 e 1801.",
      capitalAltitudeMeters: 11,
      summary:
        "O Reino Unido é um centro histórico de finanças, seguros, serviços profissionais e diplomacia, com Londres funcionando como um dos principais polos globais de mercado e informação.",
      keyFacts: [
        "Londres é uma das maiores praças financeiras do mundo.",
        "O país reúne Inglaterra, Escócia, País de Gales e Irlanda do Norte.",
        "A City de Londres tem papel central em câmbio e seguros.",
        "O sistema político combina monarquia constitucional e parlamento.",
        "O horário de verão altera a relação com mercados americanos.",
      ],
      seasons:
        "As quatro estações do hemisfério norte são claras, com dias longos no verão e curtos no inverno.",
      predominantClimate:
        "Predomina o clima temperado oceânico, com chuvas distribuídas ao longo do ano.",
      touristSpots: TOURIST_SPOTS.gb,
      religion:
        "A sociedade é plural, com presença histórica do cristianismo e crescimento da diversidade religiosa e secular.",
      culture:
        "Tradições monárquicas, literatura, música, futebol e teatro convivem com uma cena urbana cosmopolita.",
      customs:
        "Filas organizadas, pontualidade, chá e maior reserva na comunicação social são hábitos recorrentes.",
    },
    en: {
      leader: "Primer ministro: Keir Starmer",
      nationalMilestone:
        "Political union consolidated gradually between 1707 and 1801.",
      capitalAltitudeMeters: 11,
      summary:
        "The United Kingdom remains a historic center for finance, insurance, professional services and diplomacy, with London operating as one of the main global market hubs.",
      keyFacts: [
        "London is one of the world's largest financial centers.",
        "The state joins England, Scotland, Wales and Northern Ireland.",
        "The City of London is central to FX and insurance markets.",
        "The political system combines constitutional monarchy and parliament.",
        "Daylight saving time shifts its overlap with US markets.",
      ],
      seasons:
        "The four northern-hemisphere seasons are well defined, with long summer days and short winter days.",
      predominantClimate:
        "Temperate oceanic climate prevails, with rainfall spread through the year.",
      touristSpots: TOURIST_SPOTS.gb,
      religion:
        "Society is plural, with a historic Christian presence and increasing secular and religious diversity.",
      culture:
        "Monarchical traditions, literature, music, football and theater coexist with a deeply cosmopolitan urban culture.",
      customs:
        "Queue discipline, punctuality, tea culture and more reserved social etiquette are frequent habits.",
    },
    es: {
      leader: "Prime Minister: Keir Starmer",
      nationalMilestone:
        "Unión política consolidada progresivamente entre 1707 y 1801.",
      capitalAltitudeMeters: 11,
      summary:
        "El Reino Unido sigue siendo un centro histórico de finanzas, seguros, servicios profesionales y diplomacia, con Londres como uno de los grandes polos globales de mercado e información.",
      keyFacts: [
        "Londres es una de las mayores plazas financieras del mundo.",
        "El país reúne Inglaterra, Escocia, Gales e Irlanda del Norte.",
        "La City de Londres tiene papel central en divisas y seguros.",
        "El sistema político combina monarquía constitucional y parlamento.",
        "El horario de verano modifica la superposición con los mercados de EE. UU.",
      ],
      seasons:
        "Las cuatro estaciones del hemisferio norte son claras, con días largos en verano y cortos en invierno.",
      predominantClimate:
        "Predomina el clima templado oceánico, con lluvias distribuidas durante el año.",
      touristSpots: TOURIST_SPOTS.gb,
      religion:
        "La sociedad es plural, con presencia histórica del cristianismo y crecimiento de la diversidad religiosa y secular.",
      culture:
        "Tradiciones monárquicas, literatura, música, fútbol y teatro conviven con una escena urbana muy cosmopolita.",
      customs:
        "Filas ordenadas, puntualidad, cultura del té y mayor reserva en la comunicación social son hábitos frecuentes.",
    },
  },
});

Object.assign(COUNTRY_DETAILS, {
  ca: {
    pt: {
      leader: "Primeiro-ministro: Mark Carney",
      nationalMilestone: "Confederação em 1º de julho de 1867.",
      capitalAltitudeMeters: 70,
      summary:
        "O Canadá combina estabilidade institucional, alto desenvolvimento humano, recursos naturais, serviços e uma distribuição territorial ampla que exige leitura cuidadosa de fusos e sazonalidade.",
      keyFacts: [
        "É o segundo maior país do mundo em território.",
        "Opera vários fusos do Atlântico ao Pacífico.",
        "Toronto é polo financeiro e empresarial central.",
        "O bilinguismo institucional marca a vida federal.",
        "A integração comercial com os Estados Unidos é estrutural.",
      ],
      seasons:
        "As estações do hemisfério norte são nítidas, com inverno longo e frio em grande parte do país.",
      predominantClimate:
        "Predominam climas frios continentais, subárticos e temperados nas faixas mais ao sul.",
      touristSpots: TOURIST_SPOTS.ca,
      religion:
        "Pluralidade religiosa com presença histórica cristã e crescimento da diversidade cultural e secular.",
      culture:
        "A cultura combina influência britânica, francesa e imigração recente, com forte presença de natureza e vida comunitária.",
      customs:
        "Cortesia, organização urbana, respeito ao espaço comum e sensibilidade multicultural são hábitos percebidos no cotidiano.",
    },
    en: {
      leader: "Primer ministro: Mark Carney",
      nationalMilestone: "Confederation on July 1, 1867.",
      capitalAltitudeMeters: 70,
      summary:
        "Canada combines institutional stability, high human development, natural resources, services and a broad territorial distribution that requires careful timezone and seasonal reading.",
      keyFacts: [
        "It is the world's second-largest country by area.",
        "It spans several timezones from the Atlantic to the Pacific.",
        "Toronto is a key financial and business hub.",
        "Institutional bilingualism shapes federal life.",
        "Trade integration with the United States is structural.",
      ],
      seasons:
        "Northern-hemisphere seasons are clear, with long cold winters across much of the country.",
      predominantClimate:
        "Cold continental, subarctic and more temperate climates prevail depending on latitude.",
      touristSpots: TOURIST_SPOTS.ca,
      religion:
        "Religious pluralism exists alongside a historic Christian presence and growing cultural and secular diversity.",
      culture:
        "Canadian culture blends British and French influence with recent immigration, strong nature ties and community life.",
      customs:
        "Courtesy, urban order, respect for shared space and multicultural sensitivity are common habits.",
    },
    es: {
      leader: "Prime Minister: Mark Carney",
      nationalMilestone: "Confederación el 1 de julio de 1867.",
      capitalAltitudeMeters: 70,
      summary:
        "Canadá combina estabilidad institucional, alto desarrollo humano, recursos naturales, servicios y una gran extensión territorial que exige lectura cuidadosa de husos y estacionalidad.",
      keyFacts: [
        "Es el segundo país más grande del mundo por territorio.",
        "Opera varios husos desde el Atlántico hasta el Pacífico.",
        "Toronto es un polo financiero y empresarial central.",
        "El bilingüismo institucional marca la vida federal.",
        "La integración comercial con Estados Unidos es estructural.",
      ],
      seasons:
        "Las estaciones del hemisferio norte son nítidas, con inviernos largos y fríos en gran parte del país.",
      predominantClimate:
        "Predominan climas fríos continentales, subárticos y templados en las franjas más al sur.",
      touristSpots: TOURIST_SPOTS.ca,
      religion:
        "Pluralidad religiosa con presencia histórica cristiana y crecimiento de la diversidad cultural y secular.",
      culture:
        "La cultura canadiense combina influencias británicas, francesas e inmigración reciente, con fuerte presencia de naturaleza y vida comunitaria.",
      customs:
        "Cortesía, organización urbana, respeto por el espacio común y sensibilidad multicultural son hábitos frecuentes.",
    },
  },
  au: {
    pt: {
      leader: "Primeiro-ministro: Anthony Albanese",
      nationalMilestone: "Federação em 1º de janeiro de 1901.",
      capitalAltitudeMeters: 577,
      summary:
        "A Austrália reúne economia avançada, forte setor de commodities, serviços, educação internacional e uma distribuição territorial que exige atenção a fusos e diferenças sazonais do hemisfério sul.",
      keyFacts: [
        "Sydney e Melbourne concentram grande parte dos serviços corporativos.",
        "A bolsa local reflete forte presença de mineração e bancos.",
        "O país opera múltiplos fusos horários.",
        "A capital política é Canberra, não Sydney.",
        "A relação comercial com a Ásia é estratégica.",
      ],
      seasons:
        "As estações seguem o hemisfério sul: verão entre dezembro e março e inverno entre junho e setembro.",
      predominantClimate:
        "Predominam climas áridos e semiáridos no interior, com faixas temperadas e subtropicais no litoral.",
      touristSpots: TOURIST_SPOTS.au,
      religion:
        "Pluralidade religiosa com presença cristã histórica e aumento de pessoas sem filiação formal.",
      culture:
        "Vida ao ar livre, esporte, praias, multiculturalismo urbano e herança aborígine marcam a identidade australiana.",
      customs:
        "Comunicação direta, informalidade controlada, apreço por esporte e atividades ao ar livre aparecem com frequência no cotidiano.",
    },
    en: {
      leader: "Primer ministro: Anthony Albanese",
      nationalMilestone: "Federation on January 1, 1901.",
      capitalAltitudeMeters: 577,
      summary:
        "Australia combines an advanced economy, strong commodities exposure, services, international education and a territorial distribution that requires attention to southern-hemisphere timezones and seasons.",
      keyFacts: [
        "Sydney and Melbourne hold much of the corporate service base.",
        "The local exchange has strong mining and banking weight.",
        "The country spans multiple timezones.",
        "The political capital is Canberra, not Sydney.",
        "Trade ties with Asia are strategic.",
      ],
      seasons:
        "Seasons follow the southern hemisphere, with summer from December to March and winter from June to September.",
      predominantClimate:
        "Arid and semi-arid climates dominate the interior, with temperate and subtropical bands on the coast.",
      touristSpots: TOURIST_SPOTS.au,
      religion:
        "Religious plurality coexists with a historic Christian presence and growth in people without formal affiliation.",
      culture:
        "Outdoor life, sports, beaches, urban multiculturalism and Aboriginal heritage shape Australian identity.",
      customs:
        "Direct communication, controlled informality and appreciation for sports and outdoor life are common habits.",
    },
    es: {
      leader: "Prime Minister: Anthony Albanese",
      nationalMilestone: "Federación el 1 de enero de 1901.",
      capitalAltitudeMeters: 577,
      summary:
        "Australia combina economía avanzada, fuerte sector de commodities, servicios, educación internacional y una distribución territorial que exige atención a husos y estaciones del hemisferio sur.",
      keyFacts: [
        "Sydney y Melbourne concentran gran parte de los servicios corporativos.",
        "La bolsa local refleja fuerte peso de minería y bancos.",
        "El país opera varios husos horarios.",
        "La capital política es Canberra, no Sydney.",
        "La relación comercial con Asia es estratégica.",
      ],
      seasons:
        "Las estaciones siguen el hemisferio sur: verano entre diciembre y marzo e invierno entre junio y septiembre.",
      predominantClimate:
        "Predominan climas áridos y semiáridos en el interior, con franjas templadas y subtropicales en la costa.",
      touristSpots: TOURIST_SPOTS.au,
      religion:
        "Pluralidad religiosa con presencia cristiana histórica y aumento de personas sin filiación formal.",
      culture:
        "Vida al aire libre, deporte, playas, multiculturalismo urbano y herencia aborigen marcan la identidad australiana.",
      customs:
        "Comunicación directa, informalidad moderada y aprecio por el deporte y las actividades al aire libre aparecen con frecuencia.",
    },
  },
  sg: {
    pt: {
      leader: "Primeiro-ministro: Lawrence Wong",
      nationalMilestone: "Independência em 9 de agosto de 1965.",
      capitalAltitudeMeters: 15,
      summary:
        "Singapura é um hub financeiro, logístico e tecnológico compacto, com alto grau de planejamento urbano e forte conectividade com cadeias asiáticas e globais.",
      keyFacts: [
        "É um dos principais portos de transbordo do mundo.",
        "Serviços financeiros, comércio e logística têm peso central.",
        "O ambiente regulatório é conhecido por previsibilidade.",
        "Multilinguismo faz parte da rotina oficial e comercial.",
        "É sede regional de muitas multinacionais.",
      ],
      seasons:
        "Como está próxima à linha do Equador, as variações sazonais são pequenas ao longo do ano.",
      predominantClimate:
        "Predomina o clima equatorial quente e úmido com chuvas frequentes.",
      touristSpots: TOURIST_SPOTS.sg,
      religion:
        "Pluralidade religiosa com budismo, cristianismo, islamismo, taoismo e hinduísmo presentes.",
      culture:
        "Eficiência urbana, multiculturalismo, gastronomia de rua e forte integração entre comércio e mobilidade definem o cotidiano local.",
      customs:
        "Respeito às regras públicas, limpeza urbana, transporte coletivo eficiente e pragmatismo são marcas fortes da vida cotidiana.",
    },
    en: {
      leader: "Primer ministro: Lawrence Wong",
      nationalMilestone: "Independence on August 9, 1965.",
      capitalAltitudeMeters: 15,
      summary:
        "Singapore is a compact financial, logistics and technology hub with a high level of urban planning and strong links to Asian and global supply chains.",
      keyFacts: [
        "It is one of the world's leading transshipment ports.",
        "Financial services, trade and logistics are central sectors.",
        "The regulatory environment is known for predictability.",
        "Multilingualism is part of official and commercial life.",
        "It hosts many multinational regional headquarters.",
      ],
      seasons:
        "Because it is close to the equator, seasonal variation is limited throughout the year.",
      predominantClimate:
        "A hot and humid equatorial climate with frequent rain predominates.",
      touristSpots: TOURIST_SPOTS.sg,
      religion:
        "Religious pluralism includes Buddhism, Christianity, Islam, Taoism and Hinduism.",
      culture:
        "Urban efficiency, multicultural life, street food and strong integration between commerce and mobility define daily life.",
      customs:
        "Respect for public rules, urban cleanliness, efficient public transport and pragmatism are strong daily traits.",
    },
    es: {
      leader: "Prime Minister: Lawrence Wong",
      nationalMilestone: "Independencia el 9 de agosto de 1965.",
      capitalAltitudeMeters: 15,
      summary:
        "Singapur es un hub financiero, logístico y tecnológico compacto, con alto grado de planificación urbana y fuerte conectividad con cadenas asiáticas y globales.",
      keyFacts: [
        "Es uno de los principales puertos de transbordo del mundo.",
        "Servicios financieros, comercio y logística tienen peso central.",
        "El entorno regulatorio es conocido por su previsibilidad.",
        "El multilingüismo forma parte de la vida oficial y comercial.",
        "Es sede regional de muchas multinacionales.",
      ],
      seasons:
        "Como está cerca de la línea del Ecuador, las variaciones estacionales son pequeñas durante el año.",
      predominantClimate:
        "Predomina el clima ecuatorial cálido y húmedo con lluvias frecuentes.",
      touristSpots: TOURIST_SPOTS.sg,
      religion:
        "Pluralidad religiosa con budismo, cristianismo, islam, taoísmo e hinduismo presentes.",
      culture:
        "Eficiencia urbana, multiculturalismo, comida callejera y fuerte integración entre comercio y movilidad definen la vida cotidiana.",
      customs:
        "Respeto a las normas públicas, limpieza urbana, transporte colectivo eficiente y pragmatismo son rasgos fuertes del día a día.",
    },
  },
});

Object.assign(COUNTRY_DETAILS, {
  jp: {
    pt: {
      leader: "Primeiro-ministro: Sanae Takaichi",
      nationalMilestone:
        "Dia Nacional em 11 de fevereiro e outros marcos imperiais modernos.",
      capitalAltitudeMeters: 40,
      summary:
        "O Japão une alta densidade urbana, tecnologia, manufatura avançada, transportes precisos e forte coordenação entre governo, grandes grupos industriais e cadeias globais.",
      keyFacts: [
        "Tóquio é uma das maiores áreas metropolitanas do planeta.",
        "A bolsa de Tóquio influencia a abertura do mercado asiático.",
        "Trens de alta velocidade fazem parte da infraestrutura nacional.",
        "Riscos sísmicos influenciam engenharia e rotina urbana.",
        "A cultura empresarial valoriza preparo e formalidade.",
      ],
      seasons:
        "As estações são bem marcadas, com primavera e outono muito valorizados culturalmente.",
      predominantClimate:
        "Predomina o clima temperado úmido, com variações subtropicais ao sul e mais frias ao norte.",
      touristSpots: TOURIST_SPOTS.jp,
      religion:
        "Xintoísmo e budismo convivem amplamente, muitas vezes de forma complementar no cotidiano.",
      culture:
        "Etiqueta, design, gastronomia, tradição artesanal e inovação tecnológica convivem de maneira muito visível.",
      customs:
        "Pontualidade, respeito ao coletivo, silêncio em transporte e retirada de sapatos em certos ambientes são costumes fortes.",
    },
    en: {
      leader: "Primer ministro: Sanae Takaichi",
      nationalMilestone:
        "National Foundation Day on February 11 and other modern imperial milestones shape the national calendar.",
      capitalAltitudeMeters: 40,
      summary:
        "Japan combines dense urban life, technology, advanced manufacturing, precise transportation and strong coordination between government, industry groups and global supply chains.",
      keyFacts: [
        "Tokyo is one of the largest metropolitan areas in the world.",
        "The Tokyo exchange shapes the opening tone of Asian markets.",
        "High-speed rail is a core part of national infrastructure.",
        "Seismic risk influences engineering and urban routines.",
        "Business culture values preparation and formality.",
      ],
      seasons:
        "The seasons are clearly marked, with spring and autumn especially valued in social life.",
      predominantClimate:
        "Mostly humid temperate, with subtropical conditions in the south and colder weather in the north.",
      touristSpots: TOURIST_SPOTS.jp,
      religion:
        "Shinto and Buddhism coexist widely, often in a complementary way in daily life.",
      culture:
        "Etiquette, design, cuisine, craftsmanship and technological innovation coexist very visibly.",
      customs:
        "Punctuality, respect for the collective, quiet on public transport and removing shoes in some spaces are strong habits.",
    },
    es: {
      leader: "Prime Minister: Sanae Takaichi",
      nationalMilestone:
        "El Día Nacional del 11 de febrero y otros hitos imperiales modernos marcan el calendario nacional.",
      capitalAltitudeMeters: 40,
      summary:
        "Japón combina alta densidad urbana, tecnología, manufactura avanzada, transporte preciso y fuerte coordinación entre gobierno, grandes grupos industriales y cadenas globales.",
      keyFacts: [
        "Tokio es una de las mayores áreas metropolitanas del planeta.",
        "La bolsa de Tokio influye en la apertura del mercado asiático.",
        "Los trenes de alta velocidad son parte central de la infraestructura.",
        "El riesgo sísmico influye en la ingeniería y la rutina urbana.",
        "La cultura empresarial valora preparación y formalidad.",
      ],
      seasons:
        "Las estaciones están bien marcadas, con primavera y otoño muy valorados culturalmente.",
      predominantClimate:
        "Predomina el clima templado húmedo, con variaciones subtropicales al sur y condiciones más frías al norte.",
      touristSpots: TOURIST_SPOTS.jp,
      religion:
        "Sintoísmo y budismo conviven ampliamente, muchas veces de forma complementaria en la vida diaria.",
      culture:
        "Etiqueta, diseño, gastronomía, tradición artesanal e innovación tecnológica conviven de forma muy visible.",
      customs:
        "Puntualidad, respeto por lo colectivo, silencio en el transporte y quitarse los zapatos en ciertos ambientes son costumbres fuertes.",
    },
  },
  hk: {
    pt: {
      leader: "Chefe do Executivo: John Lee Ka-chiu",
      nationalMilestone: "Transferência de soberania em 1º de julho de 1997.",
      capitalAltitudeMeters: 0,
      summary:
        "Hong Kong funciona como centro financeiro e logístico de alcance internacional, conectando fluxo de capitais, comércio e serviços profissionais no leste asiático.",
      keyFacts: [
        "É uma das principais portas financeiras da Ásia.",
        "Possui densidade urbana muito alta.",
        "Inglês e chinês convivem em negócios e administração.",
        "O sistema jurídico tem raízes de common law.",
        "A relação com Shenzhen e Guangzhou é central para negócios regionais.",
      ],
      seasons:
        "As estações são menos extremas, com verão quente e úmido e inverno mais seco e ameno.",
      predominantClimate:
        "Predomina o clima subtropical úmido com influência de monções.",
      touristSpots: TOURIST_SPOTS.hk,
      religion:
        "Pluralidade religiosa, com tradições chinesas, budismo, taoismo e comunidades cristãs relevantes.",
      culture:
        "A cidade mistura herança cantonesa, ritmo financeiro intenso, gastronomia urbana e forte ambiente cosmopolita.",
      customs:
        "Ritmo acelerado, uso intenso do transporte público e etiqueta pragmática em espaços comerciais são comuns.",
    },
    en: {
      leader: "Chief Executive: John Lee Ka-chiu",
      nationalMilestone: "Transfer of sovereignty on July 1, 1997.",
      capitalAltitudeMeters: 0,
      summary:
        "Hong Kong operates as an international financial and logistics hub, connecting capital flows, trade and professional services across East Asia.",
      keyFacts: [
        "It is one of Asia's main financial gateways.",
        "Urban density is extremely high.",
        "English and Chinese coexist in business and administration.",
        "Its legal system has common-law roots.",
        "The relationship with Shenzhen and Guangzhou is central to regional business.",
      ],
      seasons:
        "Seasons are less extreme, with hot humid summers and milder drier winters.",
      predominantClimate:
        "Humid subtropical climate with monsoon influence predominates.",
      touristSpots: TOURIST_SPOTS.hk,
      religion:
        "Religious pluralism includes Chinese traditions, Buddhism, Taoism and relevant Christian communities.",
      culture:
        "The city mixes Cantonese heritage, intense financial rhythm, urban food culture and a strong cosmopolitan environment.",
      customs:
        "Fast pace, heavy public transport use and pragmatic etiquette in commercial spaces are common.",
    },
    es: {
      leader: "Jefe del Ejecutivo: John Lee Ka-chiu",
      nationalMilestone: "Transferencia de soberanía el 1 de julio de 1997.",
      capitalAltitudeMeters: 0,
      summary:
        "Hong Kong funciona como centro financiero y logístico internacional, conectando flujos de capital, comercio y servicios profesionales en Asia oriental.",
      keyFacts: [
        "Es una de las principales puertas financieras de Asia.",
        "Tiene una densidad urbana muy alta.",
        "Inglés y chino conviven en negocios y administración.",
        "Su sistema jurídico tiene raíces de common law.",
        "La relación con Shenzhen y Guangzhou es central para los negocios regionales.",
      ],
      seasons:
        "Las estaciones son menos extremas, con verano caluroso y húmedo e invierno más seco y templado.",
      predominantClimate:
        "Predomina el clima subtropical húmedo con influencia de monzones.",
      touristSpots: TOURIST_SPOTS.hk,
      religion:
        "Pluralidad religiosa con tradiciones chinas, budismo, taoísmo y comunidades cristianas relevantes.",
      culture:
        "La ciudad mezcla herencia cantonesa, ritmo financiero intenso, gastronomía urbana y fuerte ambiente cosmopolita.",
      customs:
        "Ritmo acelerado, uso intenso del transporte público y etiqueta pragmática en espacios comerciales son comunes.",
    },
  },
  cn: {
    pt: {
      leader: "Presidente: Xi Jinping",
      nationalMilestone:
        "Fundação da República Popular da China em 1º de outubro de 1949.",
      capitalAltitudeMeters: 44,
      summary:
        "A China combina escala demográfica, indústria, infraestrutura, tecnologia e planejamento estatal de longo prazo, com forte impacto nas cadeias globais de produção e comércio.",
      keyFacts: [
        "É uma das maiores economias do mundo.",
        "Opera oficialmente com um único fuso em todo o país.",
        "Mercados de Xangai e Shenzhen são relevantes para ações domésticas.",
        "A infraestrutura ferroviária de alta velocidade é muito extensa.",
        "A política industrial tem forte coordenação estatal.",
      ],
      seasons:
        "As estações variam muito entre norte, centro e sul, com inverno rigoroso em partes do norte e clima mais quente no sul.",
      predominantClimate:
        "Predominam faixas continentais, temperadas, subtropicais e áridas conforme a região.",
      touristSpots: TOURIST_SPOTS.cn,
      religion:
        "Pluralidade de tradições, incluindo budismo, taoismo, crenças populares e comunidades cristãs e muçulmanas.",
      culture:
        "A cultura chinesa valoriza continuidade histórica, festivais sazonais, família extensa e culinária regional.",
      customs:
        "Respeito à hierarquia, atenção a datas festivas e importância de relações de confiança influenciam vida social e negócios.",
    },
    en: {
      leader: "President: Xi Jinping",
      nationalMilestone:
        "Foundation of the People's Republic of China on October 1, 1949.",
      capitalAltitudeMeters: 44,
      summary:
        "China combines demographic scale, industry, infrastructure, technology and long-term state planning, with strong influence on global production and trade chains.",
      keyFacts: [
        "It is one of the world's largest economies.",
        "The whole country officially uses a single timezone.",
        "Shanghai and Shenzhen markets are key for domestic equities.",
        "High-speed rail infrastructure is extremely extensive.",
        "Industrial policy is strongly state-coordinated.",
      ],
      seasons:
        "Seasons vary widely across north, center and south, with harsh winters in parts of the north and warmer climates in the south.",
      predominantClimate:
        "Continental, temperate, subtropical and arid zones coexist depending on the region.",
      touristSpots: TOURIST_SPOTS.cn,
      religion:
        "A plural mix of traditions including Buddhism, Taoism, folk beliefs and Christian and Muslim communities.",
      culture:
        "Chinese culture values historical continuity, seasonal festivals, extended family structures and regional cuisine.",
      customs:
        "Respect for hierarchy, attention to festive dates and the importance of trusted relationships shape social and business life.",
    },
    es: {
      leader: "Presidente: Xi Jinping",
      nationalMilestone:
        "Fundación de la República Popular China el 1 de octubre de 1949.",
      capitalAltitudeMeters: 44,
      summary:
        "China combina escala demográfica, industria, infraestructura, tecnología y planificación estatal de largo plazo, con fuerte impacto en las cadenas globales de producción y comercio.",
      keyFacts: [
        "Es una de las mayores economías del mundo.",
        "Opera oficialmente con un único huso horario en todo el país.",
        "Los mercados de Shanghái y Shenzhen son relevantes para acciones domésticas.",
        "La infraestructura ferroviaria de alta velocidad es muy extensa.",
        "La política industrial tiene fuerte coordinación estatal.",
      ],
      seasons:
        "Las estaciones varían mucho entre norte, centro y sur, con inviernos rigurosos en parte del norte y clima más cálido en el sur.",
      predominantClimate:
        "Predominan zonas continentales, templadas, subtropicales y áridas según la región.",
      touristSpots: TOURIST_SPOTS.cn,
      religion:
        "Pluralidad de tradiciones, incluyendo budismo, taoísmo, creencias populares y comunidades cristianas y musulmanas.",
      culture:
        "La cultura china valora continuidad histórica, festivales estacionales, familia extensa y cocina regional.",
      customs:
        "Respeto por la jerarquía, atención a fechas festivas e importancia de las relaciones de confianza influyen en la vida social y los negocios.",
    },
  },
  in: {
    pt: {
      leader: "Primeiro-ministro: Narendra Modi",
      nationalMilestone: "Independência em 15 de agosto de 1947.",
      capitalAltitudeMeters: 216,
      summary:
        "A Índia reúne escala populacional, setor de serviços e tecnologia em expansão, forte diversidade linguística e religiosa e um mercado financeiro cada vez mais relevante no radar global.",
      keyFacts: [
        "Está entre os maiores mercados consumidores do mundo.",
        "Mumbai é centro financeiro e audiovisual de grande peso.",
        "O setor de tecnologia tem presença internacional marcante.",
        "A democracia indiana opera em sistema federal parlamentar.",
        "Feriados religiosos e cívicos variam bastante por região.",
      ],
      seasons:
        "Além das quatro estações em leitura global, a rotina também é organizada por verão, monção e estação mais seca em muitas regiões.",
      predominantClimate:
        "Predominam climas tropicais de monção, semiáridos e subtropicais, com forte variação regional.",
      touristSpots: TOURIST_SPOTS.in,
      religion:
        "Predominância do hinduísmo com forte presença do islamismo, cristianismo, sikhismo, budismo e outras tradições.",
      culture:
        "Cinema, culinária, festivais, espiritualidade e grande diversidade regional marcam a identidade indiana.",
      customs:
        "Vida familiar ampla, importância de feriados religiosos e atenção ao contexto social local são traços fortes do cotidiano.",
    },
    en: {
      leader: "Primer ministro: Narendra Modi",
      nationalMilestone: "Independence on August 15, 1947.",
      capitalAltitudeMeters: 216,
      summary:
        "India combines population scale, expanding services and technology sectors, strong linguistic and religious diversity and a financial market that has become increasingly relevant globally.",
      keyFacts: [
        "It is one of the world's largest consumer markets.",
        "Mumbai is a major financial and audiovisual center.",
        "The technology sector has a strong international footprint.",
        "Indian democracy operates as a federal parliamentary system.",
        "Religious and civic holidays vary widely by region.",
      ],
      seasons:
        "Alongside the four seasons in a global reading, everyday life is often organized around summer, monsoon and drier periods.",
      predominantClimate:
        "Tropical monsoon, semi-arid and subtropical climates predominate, with strong regional variation.",
      touristSpots: TOURIST_SPOTS.in,
      religion:
        "Hinduism is predominant, with strong Muslim, Christian, Sikh, Buddhist and other communities.",
      culture:
        "Cinema, cuisine, festivals, spirituality and strong regional diversity shape Indian identity.",
      customs:
        "Extended family life, the importance of religious holidays and attention to local social context are prominent habits.",
    },
    es: {
      leader: "Prime Minister: Narendra Modi",
      nationalMilestone: "Independencia el 15 de agosto de 1947.",
      capitalAltitudeMeters: 216,
      summary:
        "India combina escala poblacional, servicios y tecnología en expansión, fuerte diversidad lingüística y religiosa y un mercado financiero cada vez más relevante a nivel global.",
      keyFacts: [
        "Está entre los mayores mercados consumidores del mundo.",
        "Mumbai es un gran centro financiero y audiovisual.",
        "El sector tecnológico tiene presencia internacional marcada.",
        "La democracia india opera como sistema federal parlamentario.",
        "Los feriados religiosos y cívicos varían mucho por región.",
      ],
      seasons:
        "Además de las cuatro estaciones en lectura global, la rutina también se organiza por verano, monzón y estación seca en muchas regiones.",
      predominantClimate:
        "Predominan climas tropicales de monzón, semiáridos y subtropicales, con fuerte variación regional.",
      touristSpots: TOURIST_SPOTS.in,
      religion:
        "Predominio del hinduismo con fuerte presencia del islam, cristianismo, sijismo, budismo y otras tradiciones.",
      culture:
        "Cine, gastronomía, festivales, espiritualidad y gran diversidad regional marcan la identidad india.",
      customs:
        "Vida familiar amplia, importancia de feriados religiosos y atención al contexto social local son rasgos fuertes del día a día.",
    },
  },
});

Object.assign(COUNTRY_DETAILS, {
  fr: {
    pt: {
      leader: "Presidente: Emmanuel Macron",
      nationalMilestone:
        "Tomada da Bastilha em 14 de julho de 1789 como marco simbólico nacional.",
      capitalAltitudeMeters: 35,
      summary:
        "A França combina peso político na União Europeia, tradição industrial, turismo de massa, agricultura forte e uma capital central para negócios, luxo e cultura.",
      keyFacts: [
        "Paris concentra sedes corporativas, turismo e serviços públicos.",
        "O país tem papel central na política europeia.",
        "Luxo, gastronomia e moda seguem referências globais.",
        "Agricultura e energia nuclear continuam relevantes.",
        "A agenda de férias e feriados afeta fortemente turismo e mobilidade.",
      ],
      seasons:
        "As estações do hemisfério norte são bem definidas, com verão mais quente no interior e inverno frio em várias regiões.",
      predominantClimate:
        "Predomina clima temperado, com áreas oceânicas no oeste, continentais no leste e mediterrâneas no sul.",
      touristSpots: TOURIST_SPOTS.fr,
      religion:
        "País secular por tradição republicana, com diversidade religiosa e presença histórica do catolicismo.",
      culture:
        "Arte, cinema, gastronomia, moda e patrimônio urbano dão tom à identidade francesa.",
      customs:
        "Cumprimentos formais, refeições longas e apreço por etiqueta social e espaço público marcam o cotidiano.",
    },
    en: {
      leader: "President: Emmanuel Macron",
      nationalMilestone:
        "The Storming of the Bastille on July 14, 1789 is the main symbolic national milestone.",
      capitalAltitudeMeters: 35,
      summary:
        "France combines major political weight in the European Union, industrial tradition, large-scale tourism, strong agriculture and a capital central to business, luxury and culture.",
      keyFacts: [
        "Paris concentrates headquarters, tourism and public institutions.",
        "France plays a central role in European politics.",
        "Luxury, gastronomy and fashion remain global references.",
        "Agriculture and nuclear energy stay economically relevant.",
        "Holiday and vacation calendars strongly affect tourism and mobility.",
      ],
      seasons:
        "Northern-hemisphere seasons are distinct, with warmer inland summers and cold winters in many regions.",
      predominantClimate:
        "Mostly temperate, with oceanic conditions in the west, continental zones in the east and Mediterranean weather in the south.",
      touristSpots: TOURIST_SPOTS.fr,
      religion:
        "A secular republic with religious diversity and a historic Catholic presence.",
      culture:
        "Art, cinema, gastronomy, fashion and urban heritage shape French identity.",
      customs:
        "Formal greetings, longer meals and strong respect for social etiquette and public space are common.",
    },
    es: {
      leader: "Presidente: Emmanuel Macron",
      nationalMilestone:
        "La toma de la Bastilla el 14 de julio de 1789 es el principal hito simbólico nacional.",
      capitalAltitudeMeters: 35,
      summary:
        "Francia combina gran peso político en la Unión Europea, tradición industrial, turismo masivo, agricultura fuerte y una capital central para negocios, lujo y cultura.",
      keyFacts: [
        "París concentra sedes corporativas, turismo y servicios públicos.",
        "El país tiene un papel central en la política europea.",
        "Lujo, gastronomía y moda siguen siendo referencias globales.",
        "Agricultura y energía nuclear continúan siendo relevantes.",
        "El calendario de vacaciones y feriados afecta con fuerza al turismo y la movilidad.",
      ],
      seasons:
        "Las estaciones del hemisferio norte están bien definidas, con verano más cálido en el interior e invierno frío en varias regiones.",
      predominantClimate:
        "Predomina el clima templado, con áreas oceánicas en el oeste, continentales en el este y mediterráneas en el sur.",
      touristSpots: TOURIST_SPOTS.fr,
      religion:
        "País secular por tradición republicana, con diversidad religiosa y presencia histórica del catolicismo.",
      culture:
        "Arte, cine, gastronomía, moda y patrimonio urbano definen la identidad francesa.",
      customs:
        "Saludos formales, comidas largas y aprecio por la etiqueta social y el espacio público son hábitos frecuentes.",
    },
  },
  de: {
    pt: {
      leader: "Chanceler: Friedrich Merz",
      nationalMilestone:
        "Reunificação alemã em 3 de outubro de 1990 como marco contemporâneo.",
      capitalAltitudeMeters: 34,
      summary:
        "A Alemanha é uma potência industrial europeia com cadeias fortes em engenharia, automóveis, química, energia e logística, além de papel decisivo na integração econômica do continente.",
      keyFacts: [
        "Maior economia da Europa em termos nominais.",
        "Frankfurt é um centro financeiro continental.",
        "A indústria alemã é conhecida por precisão e engenharia.",
        "A estrutura federativa distribui competências entre estados.",
        "A transição energética segue central na agenda econômica.",
      ],
      seasons:
        "Primavera, verão, outono e inverno são bem definidos, com variações maiores entre norte e sul.",
      predominantClimate:
        "Predomina o clima temperado continental e oceânico de transição.",
      touristSpots: TOURIST_SPOTS.de,
      religion:
        "Cristianismo histórico com ampla secularização e maior diversidade religiosa em áreas urbanas.",
      culture:
        "Música clássica, engenharia, feiras industriais e forte vida cultural urbana moldam a identidade contemporânea.",
      customs:
        "Pontualidade, planejamento prévio, separação de resíduos e comunicação objetiva são hábitos associados ao cotidiano local.",
    },
    en: {
      leader: "Chancellor: Friedrich Merz",
      nationalMilestone:
        "German reunification on October 3, 1990 is the main modern national milestone.",
      capitalAltitudeMeters: 34,
      summary:
        "Germany is a European industrial powerhouse with strong engineering, automotive, chemicals, energy and logistics chains, while also playing a decisive role in continental economic integration.",
      keyFacts: [
        "Largest economy in Europe by nominal GDP.",
        "Frankfurt is a major continental financial center.",
        "German industry is known for precision and engineering.",
        "Its federal structure distributes powers across states.",
        "The energy transition remains a key economic issue.",
      ],
      seasons:
        "Spring, summer, autumn and winter are clearly defined, with stronger differences between north and south.",
      predominantClimate:
        "A transitional mix of temperate continental and oceanic climate prevails.",
      touristSpots: TOURIST_SPOTS.de,
      religion:
        "Historically Christian, with high secularization and greater religious diversity in urban regions.",
      culture:
        "Classical music, engineering, trade fairs and strong urban cultural life shape modern German identity.",
      customs:
        "Punctuality, prior planning, recycling routines and direct communication are common habits.",
    },
    es: {
      leader: "Canciller: Friedrich Merz",
      nationalMilestone:
        "La reunificación alemana del 3 de octubre de 1990 es el principal hito nacional contemporáneo.",
      capitalAltitudeMeters: 34,
      summary:
        "Alemania es una potencia industrial europea con cadenas fuertes en ingeniería, automoción, química, energía y logística, además de un papel decisivo en la integración económica del continente.",
      keyFacts: [
        "Es la mayor economía nominal de Europa.",
        "Fráncfort es un centro financiero continental.",
        "La industria alemana es conocida por precisión e ingeniería.",
        "La estructura federal reparte competencias entre los estados.",
        "La transición energética sigue siendo un tema económico central.",
      ],
      seasons:
        "Primavera, verano, otoño e invierno están bien definidos, con diferencias mayores entre norte y sur.",
      predominantClimate:
        "Predomina un clima templado de transición entre continental y oceánico.",
      touristSpots: TOURIST_SPOTS.de,
      religion:
        "Cristianismo histórico con amplia secularización y mayor diversidad religiosa en áreas urbanas.",
      culture:
        "Música clásica, ingeniería, ferias industriales y fuerte vida cultural urbana marcan la identidad alemana contemporánea.",
      customs:
        "Puntualidad, planificación previa, separación de residuos y comunicación objetiva son hábitos frecuentes.",
    },
  },
  ch: {
    pt: {
      leader: "Presidente da Confederação: Guy Parmelin",
      nationalMilestone:
        "Dia Nacional em 1º de agosto, associado ao pacto confederado medieval.",
      capitalAltitudeMeters: 540,
      summary:
        "A Suíça combina estabilidade institucional, finanças, alta renda, indústria de precisão e uma paisagem alpina que sustenta turismo e mobilidade sofisticada.",
      keyFacts: [
        "É conhecida por estabilidade política e segurança jurídica.",
        "Zurique e Genebra são hubs financeiros e diplomáticos.",
        "O sistema político tem forte componente federativo e plebiscitário.",
        "Opera com múltiplos idiomas oficiais.",
        "A infraestrutura ferroviária é altamente integrada.",
      ],
      seasons:
        "As estações do hemisfério norte variam bastante conforme altitude e presença dos Alpes.",
      predominantClimate:
        "Predomina o clima temperado alpino e continental, com neve frequente em áreas elevadas.",
      touristSpots: TOURIST_SPOTS.ch,
      religion:
        "Catolicismo e protestantismo têm peso histórico, com secularização e diversidade religiosa crescentes.",
      culture:
        "Organização cívica, multilinguismo, esportes de inverno e tradição bancária marcam a vida pública.",
      customs:
        "Pontualidade, ordem em espaços públicos, respeito ao silêncio e planejamento rigoroso são hábitos frequentes.",
    },
    en: {
      leader: "President of the Confederation: Guy Parmelin",
      nationalMilestone:
        "National Day on August 1 is tied to the medieval confederation pact.",
      capitalAltitudeMeters: 540,
      summary:
        "Switzerland combines institutional stability, finance, high income, precision industry and an alpine landscape that supports tourism and sophisticated regional mobility.",
      keyFacts: [
        "Known for political stability and legal certainty.",
        "Zurich and Geneva are financial and diplomatic hubs.",
        "Its political model mixes federalism and direct democracy.",
        "The country operates with multiple official languages.",
        "Rail infrastructure is highly integrated.",
      ],
      seasons:
        "Northern-hemisphere seasons vary strongly with altitude and Alpine geography.",
      predominantClimate:
        "Mainly temperate alpine and continental, with frequent snow in higher areas.",
      touristSpots: TOURIST_SPOTS.ch,
      religion:
        "Catholicism and Protestantism remain historically important, alongside secularization and growing diversity.",
      culture:
        "Civic organization, multilingual life, winter sports and banking tradition shape public identity.",
      customs:
        "Punctuality, order in public spaces, respect for quiet and careful planning are common habits.",
    },
    es: {
      leader: "Presidente de la Confederación: Guy Parmelin",
      nationalMilestone:
        "El Día Nacional del 1 de agosto se asocia al pacto confederado medieval.",
      capitalAltitudeMeters: 540,
      summary:
        "Suiza combina estabilidad institucional, finanzas, renta alta, industria de precisión y un paisaje alpino que sostiene turismo y movilidad sofisticada.",
      keyFacts: [
        "Es conocida por su estabilidad política y seguridad jurídica.",
        "Zúrich y Ginebra son hubs financieros y diplomáticos.",
        "Su sistema político combina federalismo y democracia directa.",
        "Opera con varios idiomas oficiales.",
        "La infraestructura ferroviaria es altamente integrada.",
      ],
      seasons:
        "Las estaciones del hemisferio norte varían bastante según la altitud y la presencia de los Alpes.",
      predominantClimate:
        "Predomina el clima templado alpino y continental, con nieve frecuente en áreas elevadas.",
      touristSpots: TOURIST_SPOTS.ch,
      religion:
        "Catolicismo y protestantismo tienen peso histórico, con creciente secularización y diversidad religiosa.",
      culture:
        "Organización cívica, multilingüismo, deportes de invierno y tradición bancaria marcan la vida pública.",
      customs:
        "Puntualidad, orden en espacios públicos, respeto por el silencio y planificación rigurosa son hábitos frecuentes.",
    },
  },
});

export async function loadCountryDetailContent(
  countryId: string,
  language: SupportedLanguage
) {
  const content = COUNTRY_DETAILS[countryId];
  if (!content) {
    return null;
  }

  return content[language] ?? content.pt;
}
