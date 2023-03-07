"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const index_2 = require("./index");
// import { SLGateWayData } from "./messages/SLGatewayDataMessage";
// to find units on the local network with the event-based approach:
const finder = new index_1.FindUnits();
finder.once('serverFound', async (unit) => {
    finder.close();
    console.log(`Found unit: ${JSON.stringify(unit)}`);
    await connect(unit.gatewayName, unit.address, unit.port);
});
finder.search();
// or to connect directly to an already-known unit using async/await (assuming an appropriate environment for await):
// await connect('', '10.0.0.85', 80);
// or to gather all the units that can be found in 1 second using Promises:
// let finder = new FindUnits();
// finder.searchAsync(1000).then(async (units: LocalUnit[]) => {
//   if (units.length > 0) {
//     console.log(`Found unit: ${JSON.stringify(units[0])}`);
//     await connect(units[0].gatewayName, units[0].address, units[0].port);
//   }
//   process.exit(0);
// });
// or to connect to a system remotely with Promises (set your system name and password):
// let systemName = 'Pentair: XX-XX-XX';
// let password = '1234';
// let gateway = new RemoteLogin(systemName);
// gateway.connectAsync().then(async (gatewayData: SLGateWayData) => {
//   if (!gatewayData || !gatewayData.gatewayFound || gatewayData.ipAddr === '') {
//     console.error(`Screenlogic: No unit found called ${systemName}`);
//     process.exit(1);
//   }
//   await connect(systemName, gatewayData.ipAddr, gatewayData.port, password);
//   process.exit(0);
// });
async function connect(gatewayName, ipAddr, port, password) {
    const client = new index_2.UnitConnection();
    client.init(gatewayName, ipAddr, port, password);
    await client.connectAsync();
    const result = await client.getVersionAsync();
    console.log(` version=${result.version}`);
    const state = await client.equipment.getEquipmentStateAsync(42);
    console.log(` pool temp=${state.bodies[0].currentTemp}`);
    console.log(` air temp=${state.airTemp}`);
    console.log(` salt ppm=${state.saltPPM}`);
    console.log(` pH=${state.pH}`);
    console.log(` saturation=${state.saturation}`);
    await client.closeAsync();
}
//# sourceMappingURL=example.js.map