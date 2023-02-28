'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const finder = new index_1.FindUnits();
// use this to find and connect to units local to the network this is running on
// finder.on('serverFound', function(server) {
//  connect(new ScreenLogic.UnitConnection(server));
// });
//
// finder.search();
async function app() {
    finder.close();
    // use this if you want to use a direct connection to a known unit
    // connect(new ScreenLogic.UnitConnection('10.0.0.85', 80));
    // use this to remote connect to a system by name (going through the Pentair servers)
    let gatewayName = 'Pentair: XX-XX-XX';
    const password = '1111';
    let unit;
    try {
        const finder = new index_1.FindUnits();
        const localUnits = await finder.searchAsync();
        finder.close();
        if (localUnits.length) {
            console.log(`Found units: ${JSON.stringify(localUnits)}`);
            if (gatewayName.includes('XX-XX-XX')) {
                gatewayName = localUnits[0].gatewayName;
                unit.ipAddr = localUnits[0].address;
                unit.port = localUnits[0].port;
            }
        }
        else
            console.log('No local units found');
    }
    catch (err) {
        console.error(`Error looking for local units: ${err.message}`);
    }
    if (!gatewayName.includes('XX-XX-XX')) {
        const gateway = new index_1.RemoteLogin(gatewayName);
        unit = await gateway.connectAsync();
        if (!unit || !unit.gatewayFound || unit.ipAddr === '') {
            console.log('no unit found by that name');
            return;
        }
        console.log('unit ' + gateway.systemName + ' found at ' + unit.ipAddr + ':' + unit.port);
    }
    const client = index_1.screenlogic;
    let delayCount = 0;
    // events still work, too!
    // Uncomment to log to the console.
    /*
      client.on('loggedIn', function () {
        console.log(`logged in event`);
      }).on('version', function (version) {
        console.log(` version (event)=' + version.version);
      }).on('equipmentState', function (data) {
        delayCount = 0; // reset intellibrite delay
        console.log(`equipmentState (event) update!`)
        console.log(`Equipment State:`);
        console.log(JSON.stringify(data));
      }).on('chemicalData', function (data) {
        console.log(`chemical data (event):`)
        console.log(JSON.stringify(data));
      }).on('intellichlorConfig', function (data) {
        console.log(`intellchlor (event):`)
        console.log(JSON.stringify(data));
      }).on('controllerConfig', function (data) {
        console.log(`controllerConfig (event):`)
        console.log(JSON.stringify(data));
      })
    */
    client.on('intellibriteDelay', function (sec) {
        delayCount = delayCount + sec;
        console.log(`Intellibrite light sequence delay ${delayCount}s`);
    })
        .on('loginFailed', function () {
        console.log(' unable to login (wrong password?)');
        client.closeAsync();
    });
    try {
        client.init(gatewayName, unit.ipAddr, unit.port, password);
        await client.connectAsync();
        const addClient = await client.addClientAsync();
        console.log(`Add client result: ${addClient}`);
        // EQUIPMENT
        const equipmentState = await client.equipment.getEquipmentStateAsync();
        console.log(`Equipment State: ${JSON.stringify(equipmentState)}`);
        const result = await client.getVersionAsync();
        console.log(`Pool Version: ${result.version}`);
        const customNames = await client.equipment.getCustomNamesAsync();
        console.log(`customNames: ${customNames}`);
        const controller = await client.equipment.getEquipmentConfigurationAsync();
        console.log(`Controller: ${JSON.stringify(controller)}`);
        const equipConfig = await client.equipment.getEquipmentConfigurationAsync();
        console.log(`Equipment config: ${JSON.stringify(equipConfig)}`);
        const cancelDelay = await client.equipment.cancelDelayAsync();
        console.log(`Cancel delay: ${cancelDelay}`);
        const weatherForecast = await client.equipment.getWeatherForecastAsync();
        console.log(`Weather: ${JSON.stringify(weatherForecast)}`);
        const systemTime = await client.equipment.getSystemTimeAsync();
        console.log(`System Time: ${JSON.stringify(systemTime)}`);
        const dt = systemTime.date;
        dt.setHours(12);
        const sysTime = await index_1.screenlogic.equipment.setSystemTimeAsync(dt, true);
        console.log(`set time result: ${sysTime}`);
        const hist = await index_1.screenlogic.equipment.getHistoryDataAsync();
        console.log(`history data: ${JSON.stringify(hist)}`);
        // CHLOR
        const intellichlor = await client.chlor.getIntellichlorConfigAsync();
        console.log(`Intellichlor: ${JSON.stringify(intellichlor)}`);
        const chlorOutput = await client.chlor.setIntellichlorOutputAsync(12, 0);
        console.log(`Chlor output: ${JSON.stringify(chlorOutput)}`);
        // CHEM
        const chem = await client.chem.getChemicalDataAsync();
        console.log(`Chem data: ${JSON.stringify(chem)}`);
        const chemHist = await index_1.screenlogic.chem.getChemHistoryDataAsync();
        console.log(`history data: ${JSON.stringify(chemHist)}`);
        // SCHEDULES
        const recurringSched = await client.schedule.getScheduleDataAsync(0);
        console.log(`reccuring schedules: ${JSON.stringify(recurringSched)}`);
        const runOnceSched = await client.schedule.getScheduleDataAsync(1);
        console.log(`Run once schedules: ${JSON.stringify(runOnceSched)}`);
        // The following will change your settings.  Proceed with Caution
        /*
        let addSched = await client.schedule.addNewScheduleEventAsync(SchedTypes.RECURRING);
        console.log(`Add sched response: ${addSched}`);
         let setSched = await client.schedule.setScheduleEventByIdAsync(10, 2, 500, 1200, 127, 0, 1, 99);
        console.log(`Set sched result: ${setSched}`);
        let delSched = await client.schedule.deleteScheduleEventByIdAsync(10);
        console.log(`Deleted sched result: ${delSched}`);
        */
        // PUMPS
        const pumpStatus = await client.pump.getPumpStatusAsync(1);
        console.log(`Pump 1: ${JSON.stringify(pumpStatus)}`);
        // The following will change your settings.  Proceed with Caution
        const pumpRes = await client.pump.setPumpSpeedAsync(1, 6, 2000, true);
        console.log(`Pump speed response: ${pumpRes}`);
        // BODIES
        // The following will change your settings.  Proceed with Caution
        /*
        let setPointChanged = await client.bodies.setSetPointAsync(1, 101)
        console.log(`set point changed: ${setPointChanged}`);
        let heatModeRes = await client.bodies.setHeatModeAsync(1, HeatModes.HEAT_MODE_HEATPUMP);
        console.log(`heat mode result: ${heatModeRes}`);
        */
        // CIRCUITS
        // The following will change your settings.  Proceed with Caution
        /*
        let lightRes = await client.circuits.sendLightCommandAsync(LightCommands.LIGHT_CMD_COLOR_MODE_PARTY);
        console.log(`Light result: ${lightRes}`);
        let cstate = await client.circuits.setCircuitStateAsync(3, true);
        console.log(`Circuit state: ${JSON.stringify(cstate)}`);
        let circRun = await client.circuits.setCircuitRuntimebyIdAsync(4, 5);
        console.log(`circ run res: ${circRun}`);
    */
        setTimeout(async () => {
            console.log('closing connection after 60s');
            await client.closeAsync();
        }, 60 * 1000);
        console.log('Waiting 60s.');
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        client.closeAsync();
    }
}
app()
    .then(() => { null; })
    .catch(err => {
    console.log(`App error: ${err.message}`);
});
//# sourceMappingURL=example.js.map