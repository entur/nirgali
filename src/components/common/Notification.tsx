import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearNotification } from '../../reducers/notificationSlice';

const Notification = () => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector((state) => state.notification);

  if (!notification) return null;

  return (
    <Snackbar
      key={notification.key}
      open
      autoHideDuration={notification.duration}
      onClose={() => dispatch(clearNotification())}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={() => dispatch(clearNotification())}
        severity={notification.type}
        variant="filled"
        sx={{ minWidth: 300 }}
      >
        <AlertTitle>{notification.title}</AlertTitle>
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
