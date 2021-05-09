
let BUDGET = 101.6;
let RESULTS_COUNT = 4;

interface Item 
{
  name: string;
  points: number[];
  streak_potential: number;
  price: number;
}

interface Result 
{
  items: Item[];
  score: number;
  price: number;
}

let DRIVERS: Item[] = [
  {name: "HAM", points:[45,40,43], streak_potential: 0, price: 33.3},
  {name: "VER", points:[35,44,37], streak_potential: 0, price: 25.3},
  {name: "NOR", points:[29,34,27], streak_potential: 0, price: 13.8},
  {name: "LEC", points:[20,28,22], streak_potential: 0, price: 17.9},
  {name: "BOT", points:[32, -9, 32], streak_potential: 0, price: 23.3},
  {name: "PER", points:[23,5,23], streak_potential: 0, price: 18.3},
  {name: "RIC", points:[15,19,14], streak_potential: 0, price: 16.3},
  {name: "OCO", points:[11,13,18], streak_potential: 0, price: 10.2},
  {name: "STR", points:[11,18,8], streak_potential: 0, price: 13.6},
  {name: "SAI", points:[11,23,2], streak_potential: 0, price: 14.4},
  {name: "MSC", points:[11,11,11], streak_potential: 0, price: 5.7},
  {name: "GAS", points:[2,17,10], streak_potential: 0, price: 11.7},
  {name: "TSU", points:[16,6,2], streak_potential: 0, price: 9.0},
  {name: "ALO", points:[-8,14,17], streak_potential: 0, price: 15.0},
  {name: "GIO", points:[5,8,8], streak_potential: 0, price: 7.8},
  {name: "VET", points:[12,1,4], streak_potential: 0, price: 15.0},
  {name: "RAI", points:[12,13,-13], streak_potential: 0, price: 9.3},
  {name: "RUS", points:[10,-11,3], streak_potential: 0, price: 6.3},
  {name: "MAZ", points:[-14,6,4], streak_potential: 0, price: 5.3},
  {name: "LAT", points:[1,-13,2], streak_potential: 0, price: 6.4},
];

let CONSTRUCTORS: Item[] = [
  {name: "MER", points:[67,36,70], streak_potential: 0, price: 37.6},
  {name: "RBR", points:[53,44,55], streak_potential: 5, price: 26.1},
  {name: "MCL", points:[39,48,46], streak_potential: 0, price: 18.9},
  {name: "FER", points:[26,46,19], streak_potential: 0, price: 18.7},
  {name: "AST", points:[18,14,7], streak_potential: 0, price: 16.6},
  {name: "ALP", points:[13,22,30], streak_potential: 0, price: 15.2},
  {name: "ALT", points:[13,23,7], streak_potential: 0, price: 12.9},
  {name: "ALF", points:[12,16,5], streak_potential: 0, price: 8.9},
  {name: "WIL", points:[6,4,0], streak_potential: 0, price: 6.3},
  {name: "HAA", points:[7,12,10], streak_potential: 0, price: 6.1},
];

function scoredItem(item: Item) : number 
{
    let weights = [0.45,0.2,0.35];
    let weighted_scores = item.points.map((pts,idx)=>pts*weights[idx]);
    let scores_sum = weighted_scores.reduce((acc,val)=>acc+val)
    let weights_sum = weights.reduce((acc,val)=>acc+val);
    let point_avg = scores_sum/weights_sum;
    return point_avg + item.streak_potential;
}

function turboedItem(item: Item) : Item 
{
  return {name: item.name + " (TD)",
            points: item.points.map(e=>e*2),
            streak_potential: item.streak_potential, 
            price: item.price};
}
  
function combineItemWithResults(item: Item, results: Result[]) : Result[] 
{
    return results.map(r => {
        return {items: [item].concat(r.items), score: scoredItem(item) + r.score, price: item.price + r.price}
    });
}

function retainTopResults(a: Result[], b: Result[], count: number) : Result[]
{
    return a.concat(b).sort((r1: Result, r2: Result) => r2.score > r1.score ? 1 : -1)
    .slice(0, RESULTS_COUNT);
}

function findResults(remainingBudget: number, remainingConstructors: number, constructorIndex: number,
                    remainingDrivers: number, driverIndex: number,
                    turboDriverPicked: boolean): Result[]
{
    let mustPickConstructor = remainingConstructors > 0;
    let canPickConstructor = constructorIndex < CONSTRUCTORS.length;
    let mustPickDriver = !mustPickConstructor && remainingDrivers > 0;
    let canPickDriver =  driverIndex < DRIVERS.length;

    if (remainingBudget <= 0) 
        {
            return [{items: [], score: -999999, price: 0}];
        }

    if (mustPickConstructor && canPickConstructor) 
    {
        let constructor = CONSTRUCTORS[constructorIndex];
        let resultWithPick = combineItemWithResults(constructor,findResults(remainingBudget - 
            constructor.price, remainingConstructors - 1, constructorIndex + 1,
            remainingDrivers, driverIndex,
            turboDriverPicked));

        let resultWithoutPick = findResults(remainingBudget,
                remainingConstructors, constructorIndex + 1,
                remainingDrivers, driverIndex,
                turboDriverPicked);

        return retainTopResults(resultWithPick, resultWithoutPick, RESULTS_COUNT);
    }

    if (mustPickDriver && canPickDriver) 
    {
        let driver = DRIVERS[driverIndex];
        let resultWithPick = combineItemWithResults(driver,findResults(remainingBudget - driver.price,
                remainingConstructors, constructorIndex, remainingDrivers - 1, driverIndex + 1,
                turboDriverPicked));

        if (!turboDriverPicked && driver.price < 20) 
        {
            let turboDriver = turboedItem(driver);
            let resultWithTDPick = combineItemWithResults(turboDriver,findResults(remainingBudget - 
                turboDriver.price, remainingConstructors, constructorIndex,
                remainingDrivers - 1, driverIndex + 1, true));
            resultWithPick = retainTopResults(resultWithPick, resultWithTDPick, RESULTS_COUNT);
        }
        let resultWithoutPick = findResults(remainingBudget, remainingConstructors, constructorIndex,
                remainingDrivers, driverIndex + 1, turboDriverPicked);
        return retainTopResults(resultWithPick, resultWithoutPick, RESULTS_COUNT);
    }
    return [{items: [], score: mustPickConstructor || mustPickDriver ? -9999999 : 0, price: 0}];
}

console.clear();
findResults(BUDGET, 1, 0, 5, 0, false).forEach( r => 
    {
        let printable = 
        {
            Team: r.items.map(i => i.name).join(' - '),
            Score: parseFloat(r.score.toFixed(1)),
            Price: parseFloat(r.price.toFixed(1)),
        };
    console.log(printable);
    }
);