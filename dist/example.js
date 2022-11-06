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
    const systemName = 'Pentair: XX-XX-XX';
    const password = '1111';
    let gateway = new index_1.RemoteLogin(systemName);
    var unit = await gateway.connect();
    if (!unit || !unit.gatewayFound || unit.ipAddr === '') {
        console.log('no unit found by that name');
        return;
    }
    console.log('unit ' + gateway.systemName + ' found at ' + unit.ipAddr + ':' + unit.port);
    let client = index_1.screenlogic;
    let delayCount = 0;
    // events still work, too!
    client.on('loggedIn', function () {
        console.log(`logged in event`);
    }).on('version', function (version) {
        console.log(' version (event)=' + version);
    }).on('equipmentState', function (status) {
        delayCount = 0; // reset intellibrite delay
        console.log(`equipmentState (event) update!`);
        console.log(' pool ok=' + status.ok);
        console.log(' pool temp=' + status.currentTemp[0]);
        console.log(' air temp=' + status.airTemp);
        console.log(' salt ppm=' + status.saltPPM);
        console.log(' pH=' + status.pH);
        console.log(' saturation=' + status.saturation);
    }).on('chemicalData', function (chemData) {
        console.log(`chemical data (event):`);
        console.log(' calcium=' + chemData.calcium);
        console.log(' cyanuric acid=' + chemData.cyanuricAcid);
        console.log(' alkalinity=' + chemData.alkalinity);
    }).on('intellichlorConfig', function (intellichlorConfig) {
        console.log(`intellchlor (event):`);
        console.log(' salt cell installed=' + intellichlorConfig.installed);
    }).on('controllerConfig', function (config) {
        console.log(`controllerConfig (event):`);
        console.log('    controller is in celsius=' + config.degC);
    })
        .on('intellibriteDelay', function (sec) {
        delayCount = delayCount + sec;
        console.log(`Intellibrite light sequence delay ${delayCount}s`);
    })
        .on('loginFailed', function () {
        console.log(' unable to login (wrong password?)');
        client.close();
    });
    try {
        client.init(unit.ipAddr, unit.port, password, 12345);
        await client.connect();
        let addClient = await client.addClient();
        console.log(`Add client result: ${addClient}`);
        // EQUIPMENT
        let equipmentState = await client.equipment.getEquipmentState();
        console.log(`Equipment State: ${JSON.stringify(equipmentState)}`);
        let result = await client.getVersion();
        console.log(`Pool Version: ${result}`);
        let controller = await client.equipment.getEquipmentConfiguration();
        console.log(`Controller: ${JSON.stringify(controller)}`);
        let equipConfig = await client.equipment.getEquipmentConfiguration();
        console.log(`Equipment config: ${JSON.stringify(equipConfig)}`);
        let cancelDelay = await client.equipment.cancelDelay();
        console.log(`Cancel delay: ${cancelDelay}`);
        let weatherForecast = await client.equipment.getWeatherForecast();
        console.log(`Weather: ${JSON.stringify(weatherForecast)}`);
        let systemTime = await client.equipment.getSystemTime();
        console.log(`System Time: ${JSON.stringify(systemTime)}`);
        let dt = systemTime.date;
        dt.setHours(12);
        let sysTime = await index_1.screenlogic.equipment.setSystemTime(dt, true);
        console.log(`set time result: ${sysTime}`);
        let hist = await index_1.screenlogic.equipment.getHistoryData();
        console.log(`history data: ${JSON.stringify(hist)}`);
        // CHLOR
        let intellichlor = await client.chlor.getIntellichlorConfig();
        console.log(`Intellichlor: ${JSON.stringify(intellichlor)}`);
        let chlorOutput = await client.chlor.setIntellichlorOutput(12, 0);
        console.log(`Chlor output: ${JSON.stringify(chlorOutput)}`);
        // CHEM
        let chem = await client.chem.getChemicalData();
        console.log(`Chem data: ${JSON.stringify(chem)}`);
        let chemHist = await index_1.screenlogic.chem.getChemHistoryData();
        console.log(`history data: ${JSON.stringify(chemHist)}`);
        // SCHEDULES
        let recurringSched = await client.schedule.getScheduleData(0);
        console.log(`reccuring schedules: ${JSON.stringify(recurringSched)}`);
        let runOnceSched = await client.schedule.getScheduleData(1);
        console.log(`Run once schedules: ${JSON.stringify(runOnceSched)}`);
        let addSched = await client.schedule.addNewScheduleEvent(index_1.SchedTypes.RECURRING);
        console.log(`Add sched response: ${addSched}`);
        let setSched = await client.schedule.setScheduleEventById(10, 2, 500, 1200, 127, 0, 1, 99);
        console.log(`Set sched result: ${setSched}`);
        let delSched = await client.schedule.deleteScheduleEventById(10);
        console.log(`Deleted sched result: ${delSched}`);
        // PUMPS
        let pumpStatus = await client.pump.getPumpStatus(0);
        console.log(`Pump 0: ${JSON.stringify(pumpStatus)}`);
        let pumpRes = await client.pump.setPumpSpeed(0, 1, 2000, true);
        console.log(`Pump speed response: ${pumpRes}`);
        // BODIES
        let setPointChanged = await client.bodies.setSetPoint(1, 101);
        console.log(`set point changed: ${setPointChanged}`);
        let heatModeRes = await client.bodies.setHeatMode(1, index_1.HeatModes.HEAT_MODE_HEATPUMP);
        console.log(`heat mode result: ${heatModeRes}`);
        // CIRCUITS
        let lightRes = await client.circuits.sendLightCommand(index_1.LightCommands.LIGHT_CMD_COLOR_MODE_PARTY);
        console.log(`Light result: ${lightRes}`);
        // NOT WORKING...    
        let cstate = await client.circuits.setCircuitState(3, true);
        console.log(`Circuit state: ${JSON.stringify(cstate)}`);
        let circRun = await client.circuits.setCircuitRuntimebyId(4, 5);
        console.log(`circ run res: ${circRun}`);
        setTimeout(async () => {
            console.log(`closing connection after 60s`);
            await client.close();
        }, 60 * 1000);
        console.log(`Waiting 60s.`);
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        client.close();
    }
}
app()
    .then(() => { })
    .catch(err => {
    console.log(`App error: ${err.message}`);
});
//# sourceMappingURL=example.js.map