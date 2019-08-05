# RPrez

RPrez (short for Routed Presentation) is an Electron.js based presentation runtime. It's name will probably change because I'm bad at naming things. This project is still very early in its development, documentation coming soon!

This project came to fruition thanks to some conversations and insight from the amazing [@nnja](https://github.com/nnja)! You should check out her other work.

RPrez does two things very differently from existing presentation software:

- This project separates the creation of a presentation and the delivery of a presentation into two separate steps. This project only handles the delivery of a presentation, and you can use other tools to create the slides (such as markdown-based presentation tools).
- This project also reverses the normal "presenter view" style of setup. In this project, you're presented a list of monitors, and can assign any view you want to any monitor.
    - Current views include "Audience" (aka just the slide), "Speaker" (traditional presenter view with notes, next slide, etc.), and "Clock" (a large countdown, replacing the need for a separate countdown timer). In the future I'd also like to add captioning and even language translation.

To play with it now, run these commands:

```bash
git clone https://github.com/nebrius/rprez.git

cd rprez/renderer
npm install
npm run build

cd ../main
npm install
npm run build
npm start
```

# License

Copyright (c) Bryan Hughes <bryan@nebri.us>

This file is part of RPrez.

RPrez is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

RPrez is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with RPrez.  If not, see <http://www.gnu.org/licenses/>.
