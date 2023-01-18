'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
//const ScreenLogic = require('./index');
const index_1 = require("./index");
async function app() {
    // use this to find and connect to units local to the network this is running on
    // var finder = new ScreenLogic.FindUnits();
    // finder.on('serverFound', function(server) {
    //  finder.close();
    //  connect(new ScreenLogic.UnitConnection(server));
    // });
    //
    // finder.search();
    // use this if you want to use a direct connection to a known unit
    // connect(new ScreenLogic.UnitConnection('10.0.0.85', 80));
    // use this to remote connect to a system by name (going through the Pentair servers)
    let gatewayName = 'Pentair: XX-XX-XX';
    const password = '1111';
    let unit;
    try {
        let finder = new index_1.FindUnits();
        let localUnits = await finder.searchAsync();
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
            console.log(`No local units found`);
    }
    catch (err) {
        console.error(`Error looking for local units: ${err.message}`);
    }
    if (!gatewayName.includes('XX-XX-XX')) {
        let gateway = new index_1.RemoteLogin(gatewayName);
        unit = await gateway.connectAsync();
        if (!unit || !unit.gatewayFound || unit.ipAddr === '') {
            console.log('no unit found by that name');
            return;
        }
        console.log('unit ' + gateway.systemName + ' found at ' + unit.ipAddr + ':' + unit.port);
    }
    let client = index_1.screenlogic;
    let delayCount = 0;
    // events still work, too!
    // Uncomment to log to the console.
    /*
      client.on('loggedIn', function () {
        console.log(`logged in event`);
      }).on('version', function (version) {
        console.log(' version (event)=' + version);
      }).on('equipmentState', function (data) {
        delayCount = 0; // reset intellibrite delay
        console.log(`equipmentState (event) update!`)
        console.log('Equipment State:');
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
        let addClient = await client.addClientAsync();
        console.log(`Add client result: ${addClient}`);
        // EQUIPMENT
        let equipmentState = await client.equipment.getEquipmentStateAsync();
        console.log(`Equipment State: ${JSON.stringify(equipmentState)}`);
        let result = await client.getVersionAsync();
        console.log(`Pool Version: ${result}`);
        let customNames = await client.equipment.getCustomNamesAsync();
        console.log(`customNames: ${customNames}`);
        let controller = await client.equipment.getEquipmentConfigurationAsync();
        console.log(`Controller: ${JSON.stringify(controller)}`);
        let equipConfig = await client.equipment.getEquipmentConfigurationAsync();
        console.log(`Equipment config: ${JSON.stringify(equipConfig)}`);
        let cancelDelay = await client.equipment.cancelDelayAsync();
        console.log(`Cancel delay: ${cancelDelay}`);
        let weatherForecast = await client.equipment.getWeatherForecastAsync();
        console.log(`Weather: ${JSON.stringify(weatherForecast)}`);
        let systemTime = await client.equipment.getSystemTimeAsync();
        console.log(`System Time: ${JSON.stringify(systemTime)}`);
        let dt = systemTime.date;
        dt.setHours(12);
        let sysTime = await index_1.screenlogic.equipment.setSystemTimeAsync(dt, true);
        console.log(`set time result: ${sysTime}`);
        let hist = await index_1.screenlogic.equipment.getHistoryDataAsync();
        console.log(`history data: ${JSON.stringify(hist)}`);
        // CHLOR
        let intellichlor = await client.chlor.getIntellichlorConfigAsync();
        console.log(`Intellichlor: ${JSON.stringify(intellichlor)}`);
        let chlorOutput = await client.chlor.setIntellichlorOutputAsync(12, 0);
        console.log(`Chlor output: ${JSON.stringify(chlorOutput)}`);
        // CHEM
        let chem = await client.chem.getChemicalDataAsync();
        console.log(`Chem data: ${JSON.stringify(chem)}`);
        let chemHist = await index_1.screenlogic.chem.getChemHistoryDataAsync();
        console.log(`history data: ${JSON.stringify(chemHist)}`);
        // SCHEDULES
        let recurringSched = await client.schedule.getScheduleDataAsync(0);
        console.log(`reccuring schedules: ${JSON.stringify(recurringSched)}`);
        let runOnceSched = await client.schedule.getScheduleDataAsync(1);
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
        let pumpStatus = await client.pump.getPumpStatusAsync(1);
        console.log(`Pump 1: ${JSON.stringify(pumpStatus)}`);
        // The following will change your settings.  Proceed with Caution
        let pumpRes = await client.pump.setPumpSpeedAsync(1, 6, 2000, true);
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
            console.log(`closing connection after 60s`);
            await client.closeAsync();
        }, 60 * 1000);
        console.log(`Waiting 60s.`);
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        client.closeAsync();
    }
}
app()
    .then(() => { })
    .catch(err => {
    console.log(`App error: ${err.message}`);
});
//# sourceMappingURL=example.js.map