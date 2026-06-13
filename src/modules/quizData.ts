import type { Category, CategoryId, Question } from '../types/quiz.js';

export const CATEGORIES: Category[] = [
    { id: 'all', labelKey: 'quiz.categories.all', descKey: 'quiz.categories.all_desc', icon: '🌐' },
    {
        id: 'warehouses',
        labelKey: 'quiz.categories.warehouses',
        descKey: 'quiz.categories.warehouses_desc',
        icon: '🏭',
    },
    {
        id: 'automation',
        labelKey: 'quiz.categories.automation',
        descKey: 'quiz.categories.automation_desc',
        icon: '🤖',
    },
    {
        id: 'data',
        labelKey: 'quiz.categories.data',
        descKey: 'quiz.categories.data_desc',
        icon: '📊',
    },
    {
        id: 'strategy',
        labelKey: 'quiz.categories.strategy',
        descKey: 'quiz.categories.strategy_desc',
        icon: '♟️',
    },
];

/** All quiz questions across all categories. */
export const ALL_QUESTIONS: Question[] = [
    // --- STRATEGY ---
    {
        category: 'strategy',
        q: 'Firma logistyczna wdrożyła model ML do prognozowania popytu. Które dane są NAJWAŻNIEJSZE do trenowania takiego modelu?',
        opts: [
            'Liczba pracowników w magazynie i ich wynagrodzenia',
            'Historia sprzedaży, sezonowość, dane o promocjach i czynniki makroekonomiczne',
            'Aktualne ceny paliwa i kursy walut',
            'Liczba reklamacji klientów z ostatnich 3 miesięcy',
        ],
        correct: 1,
        fb: 'Modele ML do prognozowania popytu potrzebują przede wszystkim danych historycznych (historia sprzedaży/zamówień), wzorców sezonowych, informacji o promocjach oraz czynników zewnętrznych jak trendy rynkowe. To połączenie pozwala modelowi uczyć się złożonych zależności.',
    },
    {
        category: 'strategy',
        q: 'Twoja firma rozważa wdrożenie AI. Od czego NAJLEPIEJ zacząć, aby ograniczyć ryzyko i szybko pokazać wartość?',
        opts: [
            'Od razu zautomatyzować wszystkie procesy w firmie jednocześnie',
            'Wybrać jeden pilot – konkretny proces z mierzalnymi KPI i czystymi danymi',
            'Najpierw wymienić cały system IT i ERP, a dopiero potem AI',
            'Poczekać, aż branża wypracuje standardy za 5 lat',
        ],
        correct: 1,
        fb: "Best practice wdrożenia AI to podejście 'start small, think big'. Pilot na jednym procesie (np. prognozowanie popytu dla jednej kategorii towarów) pozwala szybko pokazać ROI, zdobyć doświadczenie organizacji i minimalizować ryzyko. Skalowanie następuje po udowodnieniu wartości.",
    },
    {
        category: 'strategy',
        q: 'Który wskaźnik NAJLEPIEJ mierzy zwrot z inwestycji w system AI do zarządzania zapasami?',
        opts: [
            'Liczba funkcji w oprogramowaniu AI',
            'Redukcja wartości nadmiernych zapasów (dead stock) + poprawa fill rate + zmniejszenie kosztów magazynowania',
            'Zadowolenie pracowników z nowego systemu',
            'Szybkość wdrożenia projektu w dniach',
        ],
        correct: 1,
        fb: 'ROI z AI w zarządzaniu zapasami mierzy się przez twarde, finansowe KPI: spadek wartości zamrożonego kapitału w nadmiernych zapasach, wzrost wskaźnika realizacji zamówień (fill rate) bez braków, oraz obniżenie kosztów przestrzeni magazynowej. To pokazuje realną wartość biznesową.',
    },
    {
        category: 'strategy',
        q: "Co to jest 'cyfrowy bliźniak' (digital twin) łańcucha dostaw i jakie ma zastosowanie?",
        opts: [
            'Backup danych w drugiej lokalizacji centrum danych',
            "Wirtualna kopia fizycznego łańcucha dostaw w czasie rzeczywistym – pozwala symulować scenariusze 'co jeśli' i testować decyzje bez ryzyka",
            'Zduplikowany system ERP dla działu księgowości',
            'Program szkoleniowy dla nowych pracowników logistyki',
        ],
        correct: 1,
        fb: 'Digital twin to wirtualna replika całego łańcucha dostaw zasilana danymi z IoT, ERP i GPS. Menedżerowie mogą symulować: "co się stanie gdy zamknie się port X?", "jak zmiana dostawcy wpłynie na koszty?" lub "jak redistrybuować zapasy przed sezonem?". To narzędzie do zarządzania ryzykiem i strategicznego planowania.',
    },
    {
        category: 'strategy',
        q: "Jako menedżer ds. logistyki słyszysz o 'AI Decision Support' dla zarządu. Co to oznacza w praktyce?",
        opts: [
            'AI przejmuje wszystkie decyzje zarządu bez potrzeby angażowania ludzi',
            'System AI dostarcza rekomendacje, scenariusze i analizy ryzyka, które wspierają (ale nie zastępują) decyzje menedżerów',
            'Chatbot odpowiadający na pytania pracowników o politykę firmy',
            'Automatyczne generowanie prezentacji PowerPoint',
        ],
        correct: 1,
        fb: 'AI Decision Support to systemy, które przetwarzają ogromne ilości danych i dostarczają menedżerom: rekomendacje oparte na danych, analizy scenariuszowe, wskaźniki ryzyka i prognozy. Człowiek pozostaje w centrum decyzji – AI eliminuje informacyjne przeciążenie i zapewnia, że decyzje opierają się na pełnym obrazie sytuacji.',
    },
    {
        category: 'strategy',
        q: 'Jaki jest największy barrier wdrożenia AI w logistyce według badań branżowych?',
        opts: [
            'Brak zainteresowania ze strony zarządów firm',
            'Niska jakość i rozproszenie danych operacyjnych',
            'Zbyt wysokie koszty sprzętu komputerowego',
            'Brak dostępnych algorytmów AI dla logistyki',
        ],
        correct: 1,
        fb: 'Badania (McKinsey, Gartner) konsekwentnie wskazują, że niska jakość danych (braki, błędy, silosy systemowe) to główna przeszkoda. AI uczy się na danych – garbage in, garbage out. Przed wdrożeniem modeli ML firmy muszą zainwestować w data governance i integrację systemów ERP/WMS/TMS.',
    },
    // --- WAREHOUSES ---
    {
        category: 'warehouses',
        q: 'Autonomiczne roboty AMR (Autonomous Mobile Robots) w magazynie zastępują wózki widłowe. Jaka jest główna przewaga AMR nad tradycyjnymi rozwiązaniami?',
        opts: [
            'AMR są zawsze tańsze w zakupie niż wózki widłowe',
            'AMR nie wymagają żadnej infrastruktury – pracują w istniejącym układzie magazynu i dynamicznie omijają przeszkody',
            'AMR mogą podnosić dowolnie ciężkie ładunki',
            'AMR nie potrzebują ładowania baterii',
        ],
        correct: 1,
        fb: 'Główna przewaga AMR to elastyczność operacyjna – nie wymagają stałych torów ani przebudowy magazynu (inaczej niż starsze AGV). Nawigują autonomicznie w dynamicznym środowisku, omijają ludzi i przeszkody, i mogą pracować 20h/dobę. Wdrożenie jest szybsze i mniej kapitałochłonne niż modernizacja infrastruktury.',
    },
    {
        category: 'warehouses',
        q: 'Wizja komputerowa (computer vision) jest wdrażana w magazynie. Które zastosowanie ma NAJWIĘKSZY bezpośredni wpływ na redukcję kosztów?',
        opts: [
            'Monitorowanie stanu parkingu przed magazynem',
            'Automatyczna kontrola jakości towarów, detekcja uszkodzeń i weryfikacja kompletności zamówień',
            'Rozpoznawanie twarzy pracowników dla systemu HR',
            'Liczenie samochodów na rampach rozładunkowych',
        ],
        correct: 1,
        fb: 'Automatyczna kontrola jakości wizją komputerową eliminuje błędy kompletacji (zwroty, reklamacje), wykrywa uszkodzenia przed wysyłką i weryfikuje kompletność zamówień. Systemy osiągają 99.5%+ dokładności i działają 24/7, zastępując kosztowne ręczne inspekcje. Redukcja błędów kompletacji o 25-40% to mierzalny wynik.',
    },
    {
        category: 'warehouses',
        q: 'System WMS z AI analizuje rozmieszczenie towarów w magazynie. Jaki efekt przynosi optymalizacja slottingu (przydziału lokalizacji)?',
        opts: [
            'Zmniejszenie liczby pracowników magazynowych o 50%',
            'Skrócenie dystansu pokonywanego przez pickerów poprzez umieszczenie szybkorotujących towarów bliżej strefy wydań',
            'Eliminacja potrzeby inwentaryzacji rocznej',
            'Automatyczne zamawianie towarów od dostawców',
        ],
        correct: 1,
        fb: 'Optymalizacja slottingu to jeden z najszybszych zwrotów z AI w magazynie. Umieszczenie towarów ABC (wolumen rotacji) w optymalnych lokalizacjach skraca ścieżki kompletacji o 15-30%. Pickeri pokonują mniej kilometrów dziennie, co przekłada się na szybszą realizację zamówień i niższe koszty pracy.',
    },
    {
        category: 'warehouses',
        q: 'Co to jest "goods-to-person" (G2P) w kontekście automatyzacji magazynu?',
        opts: [
            'System dostarczania paczek bezpośrednio do klienta',
            'Technologia, w której roboty przynoszą regały lub pojemniki do stacjonarnego operatora zamiast operatora chodzącego po magazynie',
            'Oprogramowanie do zarządzania reklamacjami klientów',
            'Metoda pakowania produktów w specjalne opakowania',
        ],
        correct: 1,
        fb: "G2P odwraca tradycyjny model: zamiast operatora chodzącego między regałami, roboty (np. Kiva/Amazon Robotics, AutoStore) przynoszą pojemniki z towarem do stacjonarnego stanowiska picker'a. Efekt: 2-3x wyższa wydajność kompletacji, mniejsza liczba błędów i redukcja zmęczenia pracowników.",
    },
    {
        category: 'warehouses',
        q: 'Jak AI wspiera zarządzanie strefą cross-dockingu w dużym centrum dystrybucyjnym?',
        opts: [
            'AI automatycznie pakuje towary w pudełka',
            'AI synchronizuje harmonogramy przyjęć i wydań, przewiduje opóźnienia i dynamicznie przydziela bramki rozładunkowe',
            'AI zastępuje pracowników przy obsłudze wózków widłowych',
            'AI generuje faktury dla klientów końcowych',
        ],
        correct: 1,
        fb: 'Cross-docking wymaga precyzyjnej synchronizacji — towar musi trafić z rampy przyjęć do rampy wydań bez składowania. AI optymalizuje okna czasowe, przewiduje opóźnienia pojazdów (na podstawie GPS i warunków drogowych), dynamicznie przydziela bramki i redukuje czas przestoju towarów. Efekt: przepustowość wyższa o 20-35%.',
    },
    // --- AUTOMATION ---
    {
        category: 'automation',
        q: "Czym różni się 'predykcyjne utrzymanie' (predictive maintenance) floty od tradycyjnego utrzymania prewencyjnego?",
        opts: [
            'Predykcyjne utrzymanie odbywa się rzadziej – raz w roku zamiast kwartalnie',
            'Predykcyjne opiera się na danych z czujników i ML, by przewidzieć awarię zanim nastąpi – zamiast serwisować wg. harmonogramu',
            'Predykcyjne utrzymanie jest droższe i stosowane tylko dla luksusowych flot',
            'Nie ma różnicy – to nowe nazewnictwo dla tego samego procesu',
        ],
        correct: 1,
        fb: 'Klasyczne utrzymanie prewencyjne serwisuje pojazdy według kalendarza (np. co 10.000 km). Predykcyjne utrzymanie analizuje dane z czujników (temperatura silnika, wibracje, ciśnienie) w czasie rzeczywistym i ML wskazuje dokładnie, kiedy grozi awaria. Efekt: mniej przestojów, niższe koszty o 25-40%.',
    },
    {
        category: 'automation',
        q: 'Menedżer logistyki chce zoptymalizować trasy dla 200 pojazdów jednocześnie, uwzględniając korki, okna czasowe dostaw i ograniczenia wagi. Które podejście jest właściwe?',
        opts: [
            'Zatrudnienie dodatkowych dyspozytorów pracujących w systemie zmianowym',
            'Użycie arkusza Excel z ręcznym przypisaniem tras',
            'Algorytmy optymalizacji tras oparte na AI (VRP – Vehicle Routing Problem solvers)',
            'Zakup nowych GPS-ów dla kierowców z mapami',
        ],
        correct: 2,
        fb: 'Problem trasowania pojazdów (VRP) z wieloma ograniczeniami to klasyczny problem optymalizacyjny – człowiek nie jest w stanie efektywnie rozwiązać go dla 200 pojazdów. Systemy AI oparte na algorytmach genetycznych, uczeniu maszynowym i heurystykach rozwiązują to w minuty, redukując koszty paliwa o 10-20%.',
    },
    {
        category: 'automation',
        q: "Co to jest 'ostatnia mila' (last-mile delivery) i jak AI może tu pomóc?",
        opts: [
            'Ostatnia mila to dokumentacja przed zamknięciem magazynu',
            'Ostatni etap dostawy do klienta końcowego – AI optymalizuje kolejność dostaw, przewiduje nieobecność odbiorców i sugeruje dynamiczne zmiany trasy',
            'Kontrola jakości przed załadunkiem towarów',
            'Finalna faktura wystawiana po dostarczeniu towaru',
        ],
        correct: 1,
        fb: 'Ostatnia mila to najtrudniejszy i najdroższy etap dostawy (20-30% całkowitego kosztu). AI analizuje dane historyczne o klientach, godziny ich aktywności, warunki drogowe i dynamicznie dostosowuje kolejność oraz trasy. Efekt: wyższa skuteczność pierwszej dostawy i redukcja kosztów o 12-18%.',
    },
    {
        category: 'automation',
        q: 'Czym są drony w kontekście logistyki magazynowej i jakie mają realne zastosowanie dziś?',
        opts: [
            'Drony zastępują w pełni wszystkich pracowników magazynowych',
            'Drony są głównie używane do automatycznej inwentaryzacji – skanują kody kreskowe na wysokich regałach bez angażowania operatorów na wózkach',
            'Drony realizują dostawy do klientów w całej Polsce',
            'Drony malują oznaczenia na podłodze magazynu',
        ],
        correct: 1,
        fb: 'Realne, wdrożone dziś zastosowanie dronów w magazynach to inwentaryzacja. Drony wyposażone w kamery i skanery latają wzdłuż regałów, skanując etykiety i wykrywając braki bez zatrzymywania operacji. Redukcja czasu inwentaryzacji o 80% to udokumentowany wynik (DHL, Geodis). Dostawy dronami do klientów to wciąż skala pilotażowa.',
    },
    {
        category: 'automation',
        q: 'RPA (Robotic Process Automation) w logistyce — które zadanie NAJLEPIEJ nadaje się do automatyzacji?',
        opts: [
            'Negocjowanie stawek z nowymi przewoźnikami',
            'Ręczne przepisywanie danych z faktur do systemu ERP, weryfikacja zgodności zamówień i generowanie raportów',
            'Pakowanie produktów na linii produkcyjnej',
            'Ocena jakości relacji z klientami',
        ],
        correct: 1,
        fb: "RPA (boty software'owe) świetnie radzi sobie z powtarzalnymi, opartymi na regułach zadaniami biurowymi: data entry, sprawdzanie zgodności dokumentów, generowanie raportów, wysyłka potwierdzeń. W logistyce typowy zwrot z RPA to 200-400% w pierwszym roku. Zadania wymagające osądu, negocjacji czy relacji nadal wymagają człowieka.",
    },
    // --- DATA ---
    {
        category: 'data',
        q: 'Co to jest IoT (Internet of Things) i jak zmienia operacje logistyczne?',
        opts: [
            'System internetowy do zamawiania towarów online',
            'Sieć fizycznych urządzeń z czujnikami (ciężarówki, palety, magazyny) przesyłających dane w czasie rzeczywistym – umożliwia pełną widoczność łańcucha dostaw',
            'Platforma do komunikacji między pracownikami',
            'Oprogramowanie do zarządzania relacjami z klientami',
        ],
        correct: 1,
        fb: 'IoT to czujniki i urządzenia w fizycznym świecie podłączone do internetu: GPS w pojazdach, temperatury w chłodniach, wagi na paletach, czujniki w maszynach. W logistyce IoT daje real-time visibility: wiemy gdzie jest każda paczka, w jakiej temperaturze, czy nie była otwierana. To fundament pod AI i predictive analytics.',
    },
    {
        category: 'data',
        q: 'Firma zbiera dane z 500 ciężarówek (GPS, paliwo, prędkość). Jakie jest najbardziej wartościowe zastosowanie tych danych?',
        opts: [
            'Tworzenie cotygodniowych raportów PDF dla zarządu',
            'Budowa modeli ML przewidujących zużycie paliwa, identyfikacja nieefektywnych zachowań kierowców i dynamiczna optymalizacja tras',
            'Archiwizacja danych jako wymaganie prawne',
            'Liczenie całkowitych kilometrów przejechanych przez flotę',
        ],
        correct: 1,
        fb: 'Dane telematyczne z floty to goldmine. ML może identyfikować wzorce prowadzenia zwiększające zużycie paliwa (agresywne hamowanie, nadmierne obroty), przewidywać awarie na podstawie anomalii, i w czasie rzeczywistym sugerować alternatywne trasy. Firmy osiągają 8-15% redukcję kosztów paliwa po wdrożeniu analityki floty.',
    },
    {
        category: 'data',
        q: 'Czym jest "data lake" w kontekście transformacji cyfrowej firmy logistycznej?',
        opts: [
            'Specjalny system chłodzenia dla serwerów',
            'Centralne repozytorium przechowujące surowe dane z wszystkich systemów (ERP, WMS, TMS, IoT) w oryginalnym formacie, gotowe do analizy',
            'Oprogramowanie do wizualizacji danych w dashboardach',
            'Wirtualna sieć prywatna (VPN) dla pracowników zdalnych',
        ],
        correct: 1,
        fb: 'Data lake to scentralizowane jezioro danych – surowe dane z wszystkich systemów trafiają tam bez wcześniejszej transformacji. Różnica od data warehouse: data lake przechowuje ustrukturyzowane i nieustrukturyzowane dane (dokumenty, zdjęcia, logi). Dla logistyki oznacza to możliwość łączenia danych ERP + WMS + GPS + czujników IoT do trenowania modeli AI.',
    },
    {
        category: 'data',
        q: 'Co to jest "supply chain visibility" i dlaczego jest kluczowa dla zarządzania ryzykiem?',
        opts: [
            'Przejrzystość cennika dla klientów',
            'Zdolność do śledzenia statusu towarów, zamówień i zasobów w czasie rzeczywistym na każdym etapie łańcucha dostaw',
            'Raportowanie finansowe dla akcjonariuszy',
            'Widoczność oferty firmy w wyszukiwarkach internetowych',
        ],
        correct: 1,
        fb: 'Supply chain visibility to "widzenie" całego łańcucha w czasie rzeczywistym – gdzie są towary, jakie są statusy zamówień, gdzie grożą opóźnienia. Podczas COVID-19 firmy z wysoką visibility (np. monitorujące dostawców tier-2 i tier-3) reagowały 3-4x szybciej na zakłócenia. AI analizuje te dane proaktywnie, alertując o ryzykach zanim staną się problemem.',
    },
    {
        category: 'data',
        q: 'Które podejście do analizy danych dostarcza NAJWIĘKSZĄ wartość w zarządzaniu łańcuchem dostaw?',
        opts: [
            'Descriptive analytics – raporty historyczne "co się stało"',
            'Prescriptive analytics – AI rekomenduje konkretne działania ("zrób X, aby osiągnąć Y")',
            'Diagnostic analytics – wyjaśnianie "dlaczego to się stało"',
            'Wszystkie podejścia mają taką samą wartość',
        ],
        correct: 1,
        fb: 'Dojrzałość analityczna ewoluuje: descriptive (co?) → diagnostic (dlaczego?) → predictive (co będzie?) → prescriptive (co zrobić?). Prescriptive analytics to szczyt – AI nie tylko przewiduje, ale rekomenduje konkretne działania: "zamów 450 sztuk produktu X od dostawcy B, dostawa w środę". Największy ROI, ale wymaga dojrzałości danych i modeli.',
    },
];

/** Returns questions filtered by category (random order, max 10). */
export function getQuestions(categoryId: CategoryId): Question[] {
    const pool =
        categoryId === 'all'
            ? ALL_QUESTIONS
            : ALL_QUESTIONS.filter((q) => q.category === categoryId);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
}
