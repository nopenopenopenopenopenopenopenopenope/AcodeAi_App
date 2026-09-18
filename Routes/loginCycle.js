import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/LoginCycle/Login';
import Cadastro from '../screens/LoginCycle/Cadastro';
import Recovery from '../screens/LoginCycle/Recovery';

const Stack = createNativeStackNavigator();

// Rotas de autenticação (login e cadastro).
// `onAuthenticated` é chamado pelas telas quando o login é concluído
// (ou quando já existe um usuário salvo), fazendo o App trocar para o AppCycle.
const LoginCycle = ({ onAuthenticated }) => {
  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={{
        contentStyle: { backgroundColor: '#F5F5F5' },
        headerShown: false,
      }}>
      <Stack.Screen name="login">
        {(props) => <Login {...props} onAuthenticated={onAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen name="cadastro">
        {(props) => <Cadastro {...props} onAuthenticated={onAuthenticated} />}
      </Stack.Screen>
      <Stack.Screen name="recovery">
        {(props) => <Recovery {...props} onAuthenticated={onAuthenticated} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default LoginCycle;