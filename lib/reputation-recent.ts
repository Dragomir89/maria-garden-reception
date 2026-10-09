import {baseline,type ReputationReport} from './reputation';

import {firstRanking} from './hotel-ranking';
export const recentReport:ReputationReport={
 ranking:firstRanking,id:'latest25-2026-10-05',analysisMode:'latest25',observedAt:'2026-10-05T17:28:00.000Z',
 summary:'Анализ на последните 25 оценки в Booking по дата на публикуване, от 27.07 до 26.09.2026: 13 имат текст, 12 са само оценка. Google изисква вход за сортиране и повече отзиви; неговите коментари не участват в този анализ. Старите примери извън извадката са изключени.',
 sources:[
  {...baseline.sources[0],reviewed:0,status:'partial',note:'Общата оценка е 4,9 от 81 оценки. В тази сесия Google показва 5 подбрани коментара, но изисква вход за сортиране по дата. Последните 25 не са потвърдени и Google коментарите не участват в анализа на проблемите.',window:{target:25,order:'newest',verified:false,textCount:0,from:null,to:null}},
  {...baseline.sources[1],reviewed:25,status:'complete',note:'Прочетени са първите 25 уникални оценки при „Първо най-новите“, без филтър по език, оценка или тема. Период по публикуване: 27.07–26.09.2026. 13 имат текст, 12 са само оценка и не доказват конкретни проблеми. Общата оценка 9,4 и категориите са за целия профил, не само за тази извадка.',window:{target:25,order:'newest',verified:true,textCount:13,from:'2026-07-27',to:'2026-09-26'}}
 ],
 topics:[
  {name:'Закуска',status:'attention',finding:'Четири от 13 текстови мнения имат забележки за закуската; има и похвали.',action:'Разнообрази менюто и подобри представянето и почистването на зеленчуците.',evidence:[
   {sentiment:'negative',platform:'booking',reviewer:'Автор 1',date:'05.09.2026',summary:'Недоволна от закуската; описва ограничени предложения през два дни.'},
   {sentiment:'negative',platform:'booking',reviewer:'Автор 2',date:'30.08.2026',summary:'Закуската е добра, но представянето и почистването на зеленчуците имат нужда от подобрение.'},
   {sentiment:'negative',platform:'booking',reviewer:'Автор 3',date:'25.08.2026',summary:'Хвали персонала и чистотата, но иска по-разнообразна закуска.'},
   {sentiment:'negative',platform:'booking',reviewer:'Автор 4',date:'19.08.2026',summary:'Харесва стаята, плажа, паркинга и отношението; посочва закуската в някои дни като недостатък.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 5',date:'27.08.2026',summary:'Хвали разнообразието по дни, пресните плодове и домашно приготвената храна.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 6',date:'11.08.2026',summary:'Хвали вкусната закуска, приготвена на място.'}
  ]},
  {name:'Чистота',status:'attention',finding:'Две от 13 текстови мнения имат забележки за чистотата; други гости я хвалят.',action:'Провери баните за варовик и сапунени остатъци и контрола след почистване.',evidence:[
   {sentiment:'negative',platform:'booking',reviewer:'Автор 1',date:'05.09.2026',summary:'Недоволство от чистотата и поддръжката на вилата и градината.'},
   {sentiment:'negative',platform:'booking',reviewer:'Автор 2',date:'30.08.2026',summary:'Като цяло чисто, но с варовик по душа и сапунени остатъци по рафтчетата.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 7',date:'19.09.2026',summary:'Хвали чистотата, местоположението и закуската.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 8',date:'24.08.2026',summary:'Посочва, че е много чисто и всичко ѝ е харесало.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 9',date:'29.07.2026',summary:'Хвали чистата и добре обзаведена стая, персонала, закуската и близостта до плажа.'}
  ]},
  {name:'Шум',status:'attention',finding:'Едно от 13 текстови мнения споменава вечерен шум от близката зона за развлечения.',action:'Провери шумоизолацията и информирай гостите за по-тихите стаи.',evidence:[{sentiment:'negative',platform:'booking',reviewer:'Автор 5',date:'27.08.2026',summary:'Вечерният шум налага затваряне на прозорците. Малък проблем с климатика е отстранен бързо.'}]},
  {name:'Интернет',status:'unknown',finding:'В 13-те текстови мнения няма конкретно оплакване от интернет.',action:'Не е установен проблем; това не потвърждава качеството във всички стаи.',evidence:[]},
  {name:'Обслужване и комфорт',status:'positive',finding:'Гостите хвалят отношението, просторните стаи и близостта до плажа.',action:'Запази личното отношение и бързата реакция.',evidence:[
   {sentiment:'positive',platform:'booking',reviewer:'Автор 10',date:'27.08.2026',summary:'Силно положително мнение за гостоприемството и индивидуалното внимание.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 11',date:'06.08.2026',summary:'Хвали широката и удобна стая и приветливия, отзивчив персонал.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 12',date:'22.08.2026',summary:'Доволна от престоя, местоположението и плажа.'},
   {sentiment:'positive',platform:'booking',reviewer:'Автор 13',date:'27.08.2026',summary:'Хвали близостта до плажа, чистотата и спокойствието.'}
  ]}
 ]
};
