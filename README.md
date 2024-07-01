<p align="center">
  <a>
    <h1 align="center">Mainsail w/ Sensor Panel</h1>
    <h2 align="center"><a href="https://ddamakertech.com">By DDA Maker Tech</a>
  </a>
</p>
<p align="center">
  A modified Mainsail UI that adds moonraker sensor data & graph panel to the dashboard page.
</p>

## Purpose

Amongst <a src="https://github.com/nevermore3d/StealthMax">certain circles</a> in the 3D printing community, custom sensor measurments are increasingly becoming a core component of our 3D printing hardware. Moonraker has added support for importing custom sensor data, and the Mailsail Devs have begun to incorporate support for displaying this data. This project follows this same direction - we import custom data published to Moonraker, add it to the data store, and display it on the dashboard. It is in many ways a blatant rip-off of the temperature panel (why reinvent the wheel? temperature panel works very well)

On a personal level, this project is the core reason I migrated from RepRap to Klipper 1y+ ago. I live in a small, poorly-ventilated space and have always been weary of air quality issues related to FDM printing. Klipper's incorporation of the Raspberry Pi lends itself incredibly well towards adding custom sensors, such as the SPG40 I use to monitor my chamber's air quality. 

## Screenshots
![panel](https://github.com/stephen-opet/mainsail-sensor-panel/assets/47787706/f7afa67d-25de-47f5-8040-62b46a9890b1)
![settings](https://github.com/stephen-opet/mainsail-sensor-panel/assets/47787706/f636775e-a334-4151-a3c8-523cfc9ae415)
![ChartSelection](https://github.com/stephen-opet/mainsail-sensor-panel/assets/47787706/33771302-a5ba-4945-873d-2af7d021c476)


## Step 0 - Post your custom sensor data to MQTT, and import it into Moonraker

I will not cover this in great detail here - the specific steps users must follow to read their sensor and publish the data is unique to your specific setup. I will, however, provide these resources for you:
- **[Sensett](https://github.com/stephen-opet/sensett):** KIAUH-esque CLI module I developed to automate sensor measurements & manage MQTT as a background service. This is my recommended first-stop if you need help getting started
- **[Moonraker Docs](https://moonraker.readthedocs.io/en/latest/configuration/#sensor)):** Detailed documentation on configuring Moonraker to read MQTT data


## Step 1 - Install this forked Mainsail install

You have a few options to install this forked repo:

### A) Install Latest Release

 - Navigate to <a src="https://github.com/stephen-opet/mainsail-sensor-panel/releases">Releases</a> and download the latest release (mainsail.zip).
 - Extract .zip file contents
 - On your printer, remove the @/mainsail directory entirely; replace it with the unzipped contents
 - Restart NGINX (sudo systemctl restart nginx) or otherwise just reboot your printer
 - Refresh your browser window

### B) Build your own install
 - Download the file contents of this repo
 - Within the downloaded directory, build it with node:
  ```
  npm ci
  npm run build
  ```
 - Within the working directory, locate dist/mainsail.zip
 - Extract .zip file contents
 - On your printer, remove the @/mainsail directory entirely; replace it with the unzipped contents
 - Restart NGINX (sudo systemctl restart nginx) or otherwise just reboot your printer
 - Refresh your browser window

## Step 2 - Stay Updated

If you plan to run this forked Mainsail on your machine long-term, updating mainsail unfortunately becomes a lot more difficult - KIAUH will not work, and Moonraker update manager will want you to reinstall vanilla Mainsail. You will have to decide if you are smart, or lazy

### A) If you are smart:
Smart users will trust only themselves with maintaining software updates. They accept a greater burden of maintenance work to ensure up-to-date software
 - Fork this repo to your personal Github account
 - Periodically sync your forked repo with upstream commits - this will include updates from both mainsail-crew & the sensor-panel mod
 - Periodically reinstall mainsail on your printer

### B) If you are lazy:
Lazy users will blindly trust me, an internet stranger, to maintain their software alongside the official Mainsail repo. I MAKE NO PROMISES TO MAINTAIN THIS REPO IN A TIMELY OR CONSISTENT MANNER
 
 - Manually install the repo once time, according to Step 1
 - On your printer, navigate to Moonraker.conf and modify the [update_manager mainsail] snippet to use this repo for software updates:
  ```
  [update_manager mainsail]
  type: web
  channel: stable
  repo: stephen-opet/mainsail-sensor-panel
  path: ~/mainsail
  ```
 - The Update Manager will now manage updates for Mainsail if/when I release updates alongside mainsail-crew

## Additional Notes
The panel exists on the dashboard page, as I monitor my sensor readings very closely when operating my printer. However, it may be moved into the Maintenance page in the future - while I am able to run both the temperature & sensor eCharts on the same page without a noticable spike in resource consumption, it's not beyond the realm of possibility that some machines may exhibit difficulty rendering both graphs simultaneously. For now, and users that do struggle to render both can disable the graph through the 'settings' button on the sensor panel. 

I am a hardware guy. Javascript dev is well outside my comfort zone. This project works reasonably well, but I have no doubt a skilled JS developer can make improvements. Do not hesitate to suggest changes 

For anyone dev-minded who wants some insight into the modifications I have made, I will list out all files that have been added/changed:

New Files Added:

- Vue components for panel on dashboard:
    - /src/components/charts/SensorChart.vue
    - /src/components/panels/SensorPanelListItem.vue
    - /src/components/panels/SensorPanelListItemEdit.vue
    - /src/components/panels/SensorPanelListItemEditChartSerie.vue
    - /src/components/panels/SensorPanelSettings.vue
    - /src/components/panels/SensorPanel.vue

 - Functions to add sensor history to the data store & manage it - mirrors printer/tempHistory:
    - /src/store/server/sensorHistory/actions.ts
    - /src/store/server/sensorHistory/getters.ts
    - /src/store/server/sensorHistory/index.ts
    - /src/store/server/sensorHistory/mutations.ts
    - /src/store/server/sensorHistory/types.ts

Deleted files: components that add sensor data to misc panel - now a redundant function

 - /src/components/panels/Miscellaneous/MoonrakerSensor.vue
 - /src/components/panels/Miscellaneous/MoonrakerSensorValue.vue

Modified Files:

 - full contents of /src/locales, added localization data for Panels.SensorPanel
 - Files modified to add sensor panel to dashboard:
    - /src/components/mixins/dashboard.ts
    - /src/pages/Dashboard.vue
    - /src/store/variables.ts
 - /src/components/panels/MiscellaneousPanel.vue modified to remove moonraker sensors from Misc panel
 - Modified (new, unreleased) moonraker sensor functions to add sensor parameter_info & history_fields to data store
    - sensor/src/store/server/sensor/actions.ts
    - sensor/src/store/server/sensor/types.ts
 - /src/plugins/build-release_info.ts - repo details modified to support moonraker update center using this repo
 - Added sensorHistory to server object
    - /src/store/server/types.ts
    - /src/store/server/index.ts
    - /src/store/server/actions.ts
 - Added sensorChart features to store/gui to support user modifying chart settings over GUI:
    - /src/store/gui/actions.ts
    - /src/store/gui/getters.ts
    - /src/store/gui/index.ts
    - /src/store/gui/mutations.ts
    - /src/store/gui/types.ts

_______________________________________________________________

<p align="center">
  <a>
    <img src="https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/logo.png" alt='Mainsail logo' height="152">
    <h1 align="center">Mainsail</h1>
  </a>
</p>
<p align="center">
  Makes Klipper more accessible by adding a lightweight, responsive web user interface, centred around an intuitive and consistent design philosophy.
</p>
<p align="center">
    <a aria-label="Downloads" href="https://github.com/mainsail-crew/mainsail/releases">
      <img src="https://img.shields.io/github/downloads/mainsail-crew/mainsail/total?style=flat-square">
  </a>
    <a aria-label="Localization" href="https://docs.mainsail.xyz/development/localization">
      <img src="https://shields-staging.herokuapp.com/github/directory-file-count/mainsail-crew/mainsail/src%2Flocales?label=localizations&extension=json&type=file&style=flat-square">
  </a>
    <a aria-label="Stars" href="https://github.com/mainsail-crew/mainsail/stargazers">
      <img src="https://img.shields.io/github/stars/mainsail-crew/mainsail?style=flat-square">
  </a>
    <a aria-label="Forks" href="https://github.com/mainsail-crew/mainsail/network/members">
      <img src="https://img.shields.io/github/forks/mainsail-crew/mainsail?style=flat-square">
  </a>
    <a aria-label="License" href="https://github.com/mainsail-crew/mainsail/blob/develop/LICENSE">
      <img src="https://img.shields.io/github/license/mainsail-crew/mainsail?style=flat-square">
  </a>
    <a aria-label="Last commit" href="https://github.com/mainsail-crew/mainsail/commits/">
      <img src="https://img.shields.io/github/last-commit/meteyou/mainsail?style=flat-square">
  </a>
<br />
    <a aria-label="Size" href="https://github.com/mainsail-crew/mainsail/">
      <img src="https://img.shields.io/github/repo-size/meteyou/mainsail?style=flat-square">
  </a>
    <a aria-label="Discord" href="https://discord.gg/skWTwTD">
      <img src="https://img.shields.io/discord/758059413700345988?color=%235865F2&label=discord&logo=discord&logoColor=white&style=flat-square">
  </a>
    <a aria-label="Patreon" href="https://www.patreon.com/meteyou">
      <img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dmeteyou%26type%3Dpatrons&style=flat-square">
  </a>
</p>

## Getting Started

Visit [docs.mainsail.xyz/setup](https://docs.mainsail.xyz/setup) to get started with Mainsail.

Mainsail is also available in remote mode on [http://my.mainsail.xyz](http://my.mainsail.xyz). Find
out [more](https://docs.mainsail.xyz/setup#mymainsailxyz).

## Documentation

Visit [docs.mainsail.xyz](https://docs.mainsail.xyz) to view the full documentation.  
You can find the latest release notes [here](https://github.com/mainsail-crew/mainsail/releases).

## Screenshots

![screenshot-dashboard](https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/screenshot.png)
![Features](https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/features.png)

## Features

- **Responsive Web Interface:** _Optimized for desktops, tablets and mobile devices_
- **Printer Farm:** _Supports multiple 3D printers_
- **[Localization](https://docs.mainsail.xyz/features/localization):** _Choose between 12 different languages_
- **File Manager:** _Delete, rename and upload your G-Code and config files_
- **File Editor:** _Edit G-Code and config files with syntax highlighting in your browser_
- **[Print History](https://docs.mainsail.xyz/features/history):** _See your previous prints and their status_
- **[Statistics](https://docs.mainsail.xyz/features/history):** _View how much time your printer has been in use and the number of jobs that have succeeded or failed_
- **Job Queue:** _Queue multiple jobs and add them directly from your slicer_
- **[Temperature Presets](https://docs.mainsail.xyz/features/presets):** _Manage different temperature presets for easy preheating_
- **[Bed Mesh Visualisation](https://docs.mainsail.xyz/features/bedmesh):** _View your bed using a 3D mesh graph_
- **G-Code Viewer:** _View a 3D render of your print and follow the progress_
- **Multi-Webcam Support:** _View your print from different angles with multiple webcams_
- **Timelapse Integration:** _Automatically record a timelapse of your print using [moonraker-timelapse](https://github.com/mainsail-crew/moonraker-timelapse)_
- **Power Control:** _Control power devices such as relays, TP-Link and Tasmota devices, and more_
- **Powerful Macro-Management:** _Manage your macros on a micro level_
- **[Configurable Dashboard](https://docs.mainsail.xyz/features/dashboard-organisation):** _Create your own personal dashboard_
- **[Theming Support](https://docs.mainsail.xyz/features/theming):** _Customizable user interface including logos, backgrounds, and custom CSS_
- **[Additional Sensors](https://docs.mainsail.xyz/quicktips/additional-sensors):** _Add extra sensors to the temperature graph_
- **Exclude Objects:** _Exclude parts of your print <sup>(not officially supported by Klipper yet)</sup>_

## Help and Support

Do you need help or just want to talk? Join our active community on [Discord](https://discord.gg/skWTwTD)!

Did you find a bug or did you thought of a feature?
Please create an [Issue](https://github.com/mainsail-crew/mainsail/issues) in GitHub and let us know.

## Official Sponsors

<p align='center'>
    <img src="https://raw.githubusercontent.com/mainsail-crew/docs/master/assets/img/logo-bigtreetech.png" alt='Mainsail logo' width="150">
</p>

**BIGTREETECH** is the official mainboard partner of Mainsail. BIGTREETECH is committed to developing innovative and competitive products to better serve the 3D printing community.

## Support Mainsail

Mainsail is primarily developed and maintained by meteyou. To keep the project going he invests his free time, almost
every day. To motivate him (☕🍺😜) there are several ways to support him:

[![patreon](https://img.shields.io/badge/patreon-participate-yellow.svg?style=flat-square)](https://www.patreon.com/meteyou)
[![kofi](https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg?style=flat-square)](https://ko-fi.com/mainsail)

## Contributing

Contributions to Mainsail are always welcome!

- 📥 Pull requests and 🌟 Stars are always welcome.
- Read our [contributing guidelines](CONTRIBUTING.md) to get started,
  or find us on [Discord](https://discord.gg/mainsail), we will take the time to guide you.

Looking for a first issue to tackle?

- We tag issues with [![Good First Issue](https://img.shields.io/github/issues/mainsail-crew/mainsail/good%20first%20issue.svg)](https://github.com/mainsail-crew/mainsail/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) when we think they are well suited for people who are new to the codebase or OSS in general.
- [Talk to us](https://discord.gg/mainsail), we'll find something that suits your skills and learning interest.

## Credit, sources and inspiration

- [Kevin O'Connor](https://github.com/KevinOConnor) for the awesome 3D printer firmware [Klipper](https://github.com/KevinOConnor/klipper)
- [Eric Callahan (arksine)](https://github.com/Arksine) for [Moonraker (Klipper API)](https://github.com/Arksine/moonraker). Without Moonraker, Mainsail would not be possible.
- [lixxbox](https://github.com/lixxbox) for the Mainsail logo & Docs
- [Vue.js](https://vuejs.org/): The Progressive JavaScript Framework
- [Vuetify](https://vuetifyjs.com/): Material Design Component Framework for Vue.js

Massive thanks to the whole [Voron Design](http://vorondesign.com/) community. Without them such a project would not be
possible.

[Full Credits & License information](https://docs.mainsail.xyz/credits)
