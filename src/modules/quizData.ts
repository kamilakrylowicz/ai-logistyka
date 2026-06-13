import type { Question } from '../types/quiz.js';

/** Quiz questions on AI in logistics. */
export const questions: Question[] = [
    {
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
        q: 'Wizja komputerowa (computer vision) jest wdrażana w magazynie. Które zastosowanie ma NAJWIĘKSZY bezpośredni wpływ na redukcję kosztów?',
        opts: [
            'Monitorowanie stanu parkingu przed magazynem',
            'Automatyczna kontrola jakości towarów, detekcja uszkodzeń i weryfikacja kompletności zamówień',
            'Rozpoznawanie twarzy pracowników dla systemu HR',
            'Liczenie samochodów na rampach rozładunkowych',
        ],
        correct: 1,
        fb: 'Automatyczna kontrola jakości wizją komputerową eliminuje błędy kompletacji (zwroty, reklamacje), wykrywa uszkodzenia przed wysyłką (unikamy kosztownych reklamacji) i weryfikuje kompletność zamówień. Systemy osiągają 99.5%+ dokładność i działają 24/7, zastępując kosztowne ręczne inspekcje. Redukcja błędów kompletacji o 25-40% to mierzalny wynik.',
    },
    {
        q: "Jako menedżer ds. logistyki słyszysz o 'AI Decision Support' dla zarządu. Co to oznacza w praktyce?",
        opts: [
            'AI przejmuje wszystkie decyzje zarządu bez potrzeby angażowania ludzi',
            'System AI dostarcza rekomendacje, scenariusze i analizy ryzyka, które wspierają (ale nie zastępują) decyzje menedżerów',
            'Chatbot odpowiadający na pytania pracowników o politykę firmy',
            'Automatyczne generowanie prezentacji PowerPoint',
        ],
        correct: 1,
        fb: 'AI Decision Support to systemy, które przetwarzają ogromne ilości danych i dostarczają menedżerom: rekomendacje oparte na danych, analizy scenariuszowe, wskaźniki ryzyka i prognozy. Człowiek pozostaje w centrum decyzji – AI eliminuje informacyjny przeciążenie i zapewnia, że decyzje opierają się na pełnym obrazie sytuacji, nie na intuicji.',
    },
];
