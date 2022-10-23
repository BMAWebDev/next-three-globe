import type { NextPage } from 'next';
import { useState } from 'react';
import { Vector3 } from 'three';

import cs from 'classnames';
import s from 'src/components/Home/style.module.scss';

import { GridView, GlobalView } from 'src/components/Home/components';
import { Partner } from 'src/components/Home/types';

const Logo = '/images/partners/logo.png';

const Home: NextPage = () => {
  const [view, setView] = useState<boolean>(false);

  const partners: Array<Partner> = [
    {
      image: Logo, // Spain
      description: 'description 1',
      location: 'Spain',
      coords: new Vector3(-0.13, 0.05, 1),
    },
    {
      image: Logo, // Spain
      description: 'description 2',
      location: 'Spain',
      coords: new Vector3(-0.15, 0, 1),
    },
    {
      image: Logo, // Spain
      description: 'description 3',
      location: 'Spain',
      coords: new Vector3(-0.19, -0.03, 1),
    },
    {
      image: Logo, // Global
      description: 'description 4',
      location: 'Global',
      coords: new Vector3(0, 0, 0), // wont appear on the global view
    },
    {
      image: Logo, // UK
      description: 'description 5',
      location: 'UK',
      coords: new Vector3(-0.11, 0.26, 1),
    },
    {
      image: Logo, // UK
      description: 'description 6',
      location: 'UK',
      coords: new Vector3(-0.11, 0.21, 1),
    },
    {
      image: Logo, // Romania
      description: 'description 7',
      location: 'Romania',
      coords: new Vector3(0.17, 0.09, 1),
    },
  ];

  return (
    <div id={cs(s.homepage)} className='container'>
      <div className={cs(s.partners, 'row')}>
        <div className='col-lg-12'>
          <div className={cs(s.buttonContainer)}>
            <button type='button' onClick={() => setView(!view)}>
              Change View
            </button>
            <p>Grid / Global view</p>
          </div>

          {!view && <GridView partners={partners} />}
          {view && <GlobalView partners={partners} />}
        </div>
      </div>
    </div>
  );
};

export default Home;
