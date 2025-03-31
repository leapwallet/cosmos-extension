// import { CardDivider, DropUp, Header, HeaderActionType } from '@leapwallet/leap-ui';
// import { FINDER_TERRA, FINDER_TERRASCOPE, useFinder } from 'hooks/useFinder';
// import { Images } from 'images';
// import React from 'react';

// import { SideNavCard } from '../../components/SideNavCard';

// export default function FinderDropUp({ onCloseHandler }: { onCloseHandler: () => void }) {
//   const { currentFinderKey, setFinder } = useFinder();

//   const finders = [
//     {
//       title: 'Terra Finder',
//       icon: Images.Logos.TerraFinder,
//       subTitle: 'finder.terra.money',
//       isSelected: currentFinderKey === FINDER_TERRA,
//       onClick: () => setFinder(FINDER_TERRA),
//     },
//     {
//       title: 'TerraScope',
//       icon: Images.Logos.TerraScope,
//       subTitle: 'terrasco.pe',
//       isSelected: currentFinderKey === FINDER_TERRASCOPE,
//       onClick: () => setFinder(FINDER_TERRASCOPE),
//     },
//   ];

//   return (
//     <DropUp onClose={onCloseHandler}>
//       {(toggle) => (
//         <div className='w-[360px]'>
//           <Header title='Finder' action={{ type: HeaderActionType.CANCEL, onClick: toggle }} />
//           <div className='flex flex-col items-center px-7 pt-7 pb-10'>
//             <div className='overflow-hidden rounded-2xl'>
//               {finders.map((finder, index) => {
//                 return (
//                   <React.Fragment key={finder.title}>
//                     {index !== 0 && <CardDivider />}
//                     <SideNavCard
//                       title={finder.title}
//                       subTitle={finder.subTitle}
//                       icon={finder.icon}
//                       isSelected={finder.isSelected}
//                       onClick={finder.onClick}
//                     />
//                   </React.Fragment>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </DropUp>
//   );
// }
