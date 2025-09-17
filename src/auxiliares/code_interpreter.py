from datetime import datetime

# Función para obtener la fecha actual
def get_current_date():
    current_date = datetime.now().strftime("%Y-%m-%d")
    return current_date

# Llamada a la función
get_current_date()
