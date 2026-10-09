import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw Error('Календарът временно не е достъпен. Опитай отново.');return env.DB;}
