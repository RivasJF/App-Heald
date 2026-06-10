import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PoliticasPrivacidad() {

const handleNavigation = () => {
    // Redirige a la pantalla principal (Login)
    router.replace('/login');
};

return (
    <ImageBackground
    source={require('../../assets/fondo.jpg')}
    style={styles.backgroundImage}
    resizeMode="cover"
    >
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <Text style={styles.title}>Aviso de Privacidad</Text>
        
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>1. Información que recolectamos</Text>
            <Text style={styles.text}>
              En Health Medic, recolectamos información personal como nombre completo, correo electrónico, 
              número de teléfono y fecha de nacimiento. Estos datos son esenciales para identificarle como usuario, 
              gestionar sus citas médicas y, próximamente, facilitar procesos de autenticación segura y 
              recuperación de cuenta.
            </Text>

            <Text style={styles.sectionTitle}>2. Permisos del Dispositivo</Text>
            <Text style={styles.text}>
              Para el correcto funcionamiento de la plataforma, solicitamos los siguientes permisos:
              {"\n"}• <Text style={{fontWeight: 'bold'}}>Ubicación:</Text> Se utiliza para mostrarle los médicos y clínicas más cercanos a su posición actual y calcular distancias.
              {"\n"}• <Text style={{fontWeight: 'bold'}}>Notificaciones:</Text> (Opcional) Para enviarle recordatorios de sus citas y actualizaciones de estatus.
            </Text>

            <Text style={styles.sectionTitle}>3. Uso de la Información</Text>
            <Text style={styles.text}>
              Sus datos se utilizan para:
              {"\n"}• Gestionar la agenda entre pacientes y doctores.
              {"\n"}• Validar su identidad mediante procesos de autenticación por correo electrónico.
              {"\n"}• Recuperar el acceso a su cuenta en caso de olvido de contraseña.
              {"\n"}• Mejorar la experiencia de usuario basada en la cercanía geográfica.
            </Text>

            <Text style={styles.sectionTitle}>4. Compartición con Terceros</Text>
            <Text style={styles.text}>
              Health Medic no vende ni renta sus datos a anunciantes. Sin embargo, su información de contacto 
              es compartida con el profesional de la salud o clínica con la que usted decida agendar una 
              cita, a fin de que puedan brindarle la atención médica solicitada.
            </Text>

            <View style={{ height: 20 }} />
            <Text style={styles.sectionTitle}>5. Seguridad y Confidencialidad</Text>
            <Text style={styles.text}>
            La seguridad de sus datos es nuestra prioridad. Utilizamos protocolos de cifrado y 
            almacenamiento seguro en la nube. Tratamos toda la información médica bajo los principios 
            de confidencialidad y ética profesional que rigen el sector salud.
            </Text>

            <Text style={styles.sectionTitle}>6. Sus Derechos (ARCO)</Text>
            <Text style={styles.text}>
            Usted mantiene en todo momento el derecho de Acceso, Rectificación, Cancelación y 
            Oposición de sus datos. Puede ejercer estos derechos enviando una solicitud a través 
            de nuestra sección de soporte en su perfil de usuario.
            </Text>

            <Text style={styles.sectionTitle}>7. Conservación de Datos</Text>
            <Text style={styles.text}>
            Mantendremos su información mientras su cuenta permanezca activa o sea necesaria para 
            el cumplimiento de obligaciones legales de registros médicos.
            </Text>

            <Text style={styles.sectionTitle}>8. Contacto</Text>
            <Text style={styles.text}>
            Si tiene dudas sobre este aviso, puede contactarnos en:
            {"\n"}Email: soporte@heald.com
            {"\n"}Web: www.healthmedic-heald.com
            </Text>

            <View style={{ height: 30 }} />
        </ScrollView>

        <View style={styles.buttonContainer}>
            <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleNavigation}
            >
            <Text style={styles.buttonTextSecondary}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleNavigation}
            >
            <Text style={styles.buttonTextPrimary}>Aceptar</Text>
            </TouchableOpacity>
        </View>
        </View>
    </SafeAreaView>
    <StatusBar style="dark" />
    </ImageBackground>
);
}

const styles = StyleSheet.create({
backgroundImage: {
    flex: 1,
},
safeArea: {
    flex: 1,
},
container: {
    flex: 1,
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
},
title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#072B66',
    textAlign: 'center',
    marginBottom: 20,
},
scrollContent: {
    flex: 1,
},
sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#072B66',
    marginTop: 15,
    marginBottom: 5,
},
text: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    textAlign: 'justify',
},
buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
},
button: {
    flex: 0.48,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
},
buttonPrimary: {
    backgroundColor: '#4CAFED',
},
buttonSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
},
buttonTextPrimary: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
},
buttonTextSecondary: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
},
});