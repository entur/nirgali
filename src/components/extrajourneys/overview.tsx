import { Contrast } from '@entur/layout';
import { SecondaryButton } from '@entur/button';
import { Switch } from '@entur/form';
import { useNavigate } from 'react-router-dom';

export const Overview = () => {
  const navigate = useNavigate();
  return (
    <>
      <h2 className="text-center text-white">Oversikt</h2>;<br></br>
      <div>
        <Contrast>
          <SecondaryButton
            width="fluid"
            onClick={() => navigate('/ekstraavganger/ny')}
          >
            Ny ekstraavgang
          </SecondaryButton>
        </Contrast>
      </div>
      <br></br>
      <Contrast>
        <div style={{ padding: '0 .5em' }}>
          <Switch checked={false} onChange={() => {}}>
            Vis passerte ekstraavganger
          </Switch>
        </div>
      </Contrast>
      <br></br>
    </>
  );
};
