"use client";

import { useEffect } from "react";

export default function ConsoleEffect() {
    useEffect(() => {
        console.clear();
        const style = 'color: #2563eb; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 0px #000;';
        const style2 = 'color: #999; font-size: 12px;';

        console.log(`%c
   __  __     __     __   ____     ____   _  __
  / / / /    / /    / /  / /\\_\\   / __ \\ | |/ /
 / /_/ /    / /    / /  / / / /  / /_/ / |   /
/ __  /    / /___ / /  / /_/ /  / _, _/ / |
\\/_/\\/    /_____//_/  /_____/  /_/ |_| /_/|_|
        `, style);

        console.log('%cWelcome to The Living Lab.', style);
        console.log('%cCurious? Check out the source code: https://github.com/Aedwon/aedwon-portfolio', style2);
    }, []);

    return null;
}
