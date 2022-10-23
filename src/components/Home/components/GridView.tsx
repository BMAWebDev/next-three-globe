import { ReactElement } from 'react';
import Image from 'next/image';

import { Props } from '../types';

import cs from 'classnames';
import s from '../style.module.scss';

export default function GridView({ partners }: Props): ReactElement {
  return (
    <div id={cs(s.gridView)} className='row'>
      {partners.map((partner, index) => {
        return (
          <div
            key={index}
            className='col-lg-4'
            style={{ marginBottom: '30px' }}
          >
            <div className={cs(s.partnerMasterContainer)}>
              <div className='row justify-content-center g-0'>
                <div
                  style={{
                    width: '213px',
                    height: '46px',
                    position: 'relative',
                  }}
                >
                  <Image
                    priority={true}
                    src={partner.image}
                    layout='fill'
                    alt='partner logo'
                    objectFit='contain'
                  />
                </div>
              </div>

              <div className='d-flex flex-row justify-content-center w-100 separator-light my-4 g-0' />

              <div className='font-18 text-white mb-4'>
                {partner.description}
              </div>

              <div className='d-flex flex-column'>
                <div className='d-flex flex-row font-16 grey-light justify-content-center'>
                  <div>Location:</div>
                  <div className='mx-2'>{partner.location}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
