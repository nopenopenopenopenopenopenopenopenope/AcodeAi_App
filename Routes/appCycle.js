import { Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/home';
import Medicine from '../screens/medicine';
import Stock from '../screens/stock';
import Calendar from '../screens/calendar';
import Info from '../screens/info';
import Profile from '../screens/profile';
import Reports from '../screens/reports';
import Diet from '../screens/diet';

const Stack = createNativeStackNavigator();

const getSelectedPacient = (profile, pacients) => {
  return pacients?.find((p) => p.id === profile?.selectedPacient) ?? null;
};

// Um usuário só tem um estoque (profile.stockId), mas um estoque pode
// ter vários usuários (stock.userIds).
const getUserStock = (profile, stocks) => {
  return stocks?.find((s) => s.id === profile?.stockId) ?? null;
};

// Rotas do app em si (home, profile, info, calendar, stock, reports, diet, medicine).
// Só deve ser exibida depois que o usuário estiver logado.
const AppCycle = ({
  openForm,
  profilestuff,
  pacientstuff,
  stockstuff,
  onSelectPacient,
}) => {
  const prototypeHeight = Dimensions.get('window').height;
  const selectedPacient = getSelectedPacient(profilestuff, pacientstuff);
  const userStock = getUserStock(profilestuff, stockstuff);

  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{
        contentStyle: {
          backgroundColor: '#F5F5F5',
          paddingBottom: prototypeHeight / 12,
          paddingTop: prototypeHeight / 10 + prototypeHeight / 80,
        },
        headerShown: false,
      }}>
      <Stack.Screen name="home">
        {(props) => <Home {...props} paciente={selectedPacient} func={openForm} />}
      </Stack.Screen>
      <Stack.Screen name="profile">
        {(props) => (
          <Profile
            {...props}
            profile={profilestuff}
            pacients={pacientstuff}
            func={openForm}
            onSelectPacient={onSelectPacient}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="info">
        {(props) => (
          <Info
            {...props}
            paciente={selectedPacient}
            func={openForm}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="calendar">
        {(props) => <Calendar {...props} paciente={selectedPacient} func={openForm} />}
      </Stack.Screen>
      <Stack.Screen name="stock">
        {(props) => <Stock {...props} stock={userStock} func={openForm} />}
      </Stack.Screen>
      <Stack.Screen name="reports">
        {(props) => <Reports {...props} paciente={selectedPacient} func={openForm} />}
      </Stack.Screen>
      <Stack.Screen name="diet">
        {(props) => <Diet {...props} paciente={selectedPacient} func={openForm} />}
      </Stack.Screen>
      <Stack.Screen name="medicine">
        {(props) => (
          <Medicine
            {...props}
            paciente={selectedPacient}
            func={openForm}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AppCycle;