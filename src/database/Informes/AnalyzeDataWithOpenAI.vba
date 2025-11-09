Sub AnalyzeDataWithOpenAI()
    Dim apiKey As String
    Dim selectedModel As String
    Dim endpoint As String
    Dim dataToAnalyze As String
    Dim httpRequest As Object
    Dim response As String
    Dim parsedResponse As String
    Dim selectedRange As Range
    Dim analysisType As String
    
    ' Solicitar API key
    apiKey = InputBox("Ingresa tu API Key de OpenAI:", "Autenticación Segura")
    If apiKey = "" Then Exit Sub
    
    ' Seleccionar tipo de análisis
    analysisType = SelectAnalysisType()
    If analysisType = "" Then Exit Sub
    
    selectedModel = "gpt-3.5-turbo"
    endpoint = "https://api.openai.com/v1/chat/completions"
    
    ' Seleccionar rango a analizar
    On Error Resume Next
    Set selectedRange = Application.InputBox( _
        Title:="Análisis con OpenAI - " & analysisType, _
        prompt:="Selecciona el rango de celdas a analizar:", _
        Type:=8)
    On Error GoTo 0
    
    If selectedRange Is Nothing Then Exit Sub
    
    ' Obtener y preparar los datos
    dataToAnalyze = GetRangeDataAsText(selectedRange)
    
    If dataToAnalyze = "" Then
        MsgBox "El rango seleccionado está vacío o contiene solo valores no válidos.", vbExclamation
        Exit Sub
    End If
    
    Debug.Print "Datos a analizar: " & dataToAnalyze
    
    ' Crear solicitud HTTP
    Set httpRequest = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    
    On Error GoTo ErrorHandler
    
    httpRequest.Open "POST", endpoint, False
    httpRequest.setRequestHeader "Content-Type", "application/json"
    httpRequest.setRequestHeader "Authorization", "Bearer " & apiKey
    httpRequest.setTimeouts 30000, 30000, 30000, 30000
    
    ' Configurar payload con PROMPT MEJORADO
    Dim payload As String
    payload = "{"
    payload = payload & """model"": """ & selectedModel & ""","
    payload = payload & """messages"": [{"
    payload = payload & """role"": ""user"","
    payload = payload & """content"": """ & CreateAnalysisPrompt(analysisType, dataToAnalyze) & """"
    payload = payload & "}],"
    payload = payload & """max_tokens"": 1000,"
    payload = payload & """temperature"": 0.7"
    payload = payload & "}"
    
    Debug.Print "Payload: " & payload
    
    ' Enviar solicitud
    httpRequest.Send payload
    
    ' Verificar respuesta
    If httpRequest.Status = 200 Then
        response = httpRequest.responseText
        Debug.Print "Respuesta completa: " & response
        
        If Len(response) > 0 Then
            parsedResponse = ParseOpenAIResponse(response)
            DisplayAnalysisResults parsedResponse, analysisType, selectedRange.Address
        Else
            MsgBox "?? La API respondió con éxito pero la respuesta está vacía.", vbExclamation
        End If
    Else
        MsgBox "? Error en la API: " & httpRequest.Status & " - " & httpRequest.statusText & _
               vbCrLf & "Response: " & Left(httpRequest.responseText, 500), vbCritical
    End If
    
    Exit Sub
    
ErrorHandler:
    MsgBox "? Error: " & Err.Description & vbCrLf & _
           "Número: " & Err.Number, vbCritical
End Sub

Function SelectAnalysisType() As String
    Dim analysisTypes As Variant
    Dim selectedIndex As Integer
    analysisTypes = Array( _
        "resumen|Resumen y análisis general", _
        "tendencias|Identificar tendencias y patrones", _
        "estadisticas|Análisis estadístico básico", _
        "problemas|Identificar problemas y oportunidades", _
        "recomendaciones|Recomendaciones y sugerencias", _
        "clasificar|Clasificar y categorizar datos" _
    )
    
    Dim typeList As String
    typeList = ""
    
    Dim i As Integer
    For i = 0 To UBound(analysisTypes)
        typeList = typeList & (i + 1) & ". " & Split(analysisTypes(i), "|")(1) & vbCrLf
    Next i
    
    selectedIndex = Val(InputBox( _
        "Selecciona el tipo de análisis:" & vbCrLf & vbCrLf & _
        typeList & vbCrLf & _
        "Ingresa el número del análisis (1-" & UBound(analysisTypes) + 1 & "):", _
        "Tipo de Análisis"))
    
    If selectedIndex >= 1 And selectedIndex <= UBound(analysisTypes) + 1 Then
        SelectAnalysisType = Split(analysisTypes(selectedIndex - 1), "|")(0)
    Else
        SelectAnalysisType = ""
    End If
End Function

Function CreateAnalysisPrompt(analysisType As String, data As String) As String
    Dim prompt As String
    
    Select Case analysisType
        Case "resumen"
            prompt = "Por favor analiza y resume los siguientes datos. Proporciona un resumen conciso, identifica los puntos clave y destaca la información más importante. Datos: "
        
        Case "tendencias"
            prompt = "Analiza los siguientes datos e identifica tendencias, patrones y correlaciones. Señala cualquier comportamiento cíclico, tendencias crecientes/decrecientes y anomalías. Datos: "
        
        Case "estadisticas"
            prompt = "Realiza un análisis estadístico básico de estos datos. Si son numéricos, calcula promedios, rangos, y variaciones. Si son textuales, analiza frecuencia y distribución. Datos: "
        
        Case "problemas"
            prompt = "Examina estos datos e identifica posibles problemas, inconsistencias, oportunidades de mejora y áreas de riesgo. Sé específico y sugiere posibles causas. Datos: "
        
        Case "recomendaciones"
            prompt = "Basado en el análisis de estos datos, proporciona recomendaciones prácticas, sugerencias de acción y próximos pasos. Sé concreto y aplicable. Datos: "
        
        Case "clasificar"
            prompt = "Clasifica y categoriza estos datos. Agrupa por similitudes, identifica categorías principales y organiza la información de manera lógica. Datos: "
        
        Case Else
            prompt = "Analiza los siguientes datos y proporciona insights útiles: "
    End Select
    
    ' Agregar instrucciones claras
    prompt = prompt & data & ". "
    prompt = prompt & "Responde en español de manera clara y estructurada. "
    prompt = prompt & "Sé específico y proporciona ejemplos concretos basados en los datos. "
    prompt = prompt & "Si los datos son insuficientes, indica qué información adicional sería útil."
    
    CreateAnalysisPrompt = CleanTextForJSON(prompt)
End Function

Function GetRangeDataAsText(rng As Range) As String
    Dim cell As Range
    Dim result As String
    Dim cellValue As String
    
    ' Agregar información sobre el rango
    result = "Datos de " & rng.Count & " celdas: "
    
    For Each cell In rng
        If Not IsEmpty(cell) And Not IsError(cell) Then
            cellValue = CStr(cell.Value)
            If Trim(cellValue) <> "" Then
                ' Agregar contexto de posición si es útil
                If rng.Count > 1 Then
                    result = result & "[" & cell.Address(False, False) & "]: " & cellValue & "; "
                Else
                    result = result & cellValue & "; "
                End If
            End If
        End If
    Next cell
    
    ' Limitar tamaño
    If Len(result) > 3000 Then
        result = Left(result, 3000)
        result = result & "... (datos truncados por longitud)"
    End If
    
    GetRangeDataAsText = result
End Function

Function CleanTextForJSON(text As String) As String
    ' Limpiar texto para JSON
    Dim cleanText As String
    
    cleanText = Replace(text, """", "'")
    cleanText = Replace(cleanText, vbCrLf, " ")
    cleanText = Replace(cleanText, vbTab, " ")
    cleanText = Replace(cleanText, "\", "/")
    cleanText = WorksheetFunction.Trim(cleanText)
    
    CleanTextForJSON = cleanText
End Function

Function ParseOpenAIResponse(jsonResponse As String) As String
    Dim json As Object
    Set json = JsonConverter.ParseJson(jsonResponse)
    
    ' Navigate the JSON structure to find the content
    On Error GoTo ErrorHandler
    ParseOpenAIResponse = json("choices")(1)("message")("content")
    Exit Function

ErrorHandler:
    ParseOpenAIResponse = "Error: No se pudo encontrar contenido en la respuesta JSON."
End Function


Function ExtractJSONContent(rawContent As String) As String
    ' Extraer y limpiar contenido JSON
    Dim content As String
    content = rawContent
    
    ' Reemplazar secuencias de escape
    content = Replace(content, "\""", """")
    content = Replace(content, "\\", "\")
    content = Replace(content, "\n", vbCrLf)
    content = Replace(content, "\t", vbTab)
    content = Replace(content, "\r", vbCr)
    content = Replace(content, "\/", "/")
    
    ExtractJSONContent = content
End Function

Sub DisplayAnalysisResults(result As String, analysisType As String, rangeAddress As String)
    Dim ws As Worksheet
    Dim timestamp As String
    
    timestamp = Format(Now, "yyyy-mm-dd hh:mm:ss")
    
    ' Crear nueva hoja para resultados
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    On Error Resume Next
    ws.Name = "Analisis_" & Format(Now, "hhmmss")
    On Error GoTo 0
    
    ' Escribir resultados
    ws.Range("A1").Value = "ANÁLISIS CON OPENAI"
    ws.Range("A2").Value = "Tipo de análisis: " & UCase(analysisType)
    ws.Range("A3").Value = "Fecha y hora: " & timestamp
    ws.Range("A4").Value = "Rango analizado: " & rangeAddress
    ws.Range("A6").Value = "RESULTADO:"
    ws.Range("A7").Value = result
    
    ' Formatear
    With ws
        .Columns("A").ColumnWidth = 100
        .Columns("A").WrapText = True
        .Range("A1:A6").Font.Bold = True
        .Range("A1").Font.Size = 14
        .Range("A7").Font.Size = 11
        .Range("A7").VerticalAlignment = xlTop
    End With
    
    MsgBox "? Análisis de '" & analysisType & "' completado!" & vbCrLf & _
           "Resultados guardados en la hoja '" & ws.Name & "'", vbInformation
End Sub

' Función de prueba con prompt específico
Sub TestWithGoodPrompt()
    Dim apiKey As String
    Dim httpRequest As Object
    Dim response As String
    
    apiKey = InputBox("Ingresa tu API Key para prueba con buen prompt:", "Test Mejorado")
    If apiKey = "" Then Exit Sub
    
    Set httpRequest = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    
    On Error GoTo TestError
    
    httpRequest.Open "POST", "https://api.openai.com/v1/chat/completions", False
    httpRequest.setRequestHeader "Content-Type", "application/json"
    httpRequest.setRequestHeader "Authorization", "Bearer " & apiKey
    httpRequest.setTimeouts 30000, 30000, 30000, 30000
    
    Dim payload As String
    payload = "{"
    payload = payload & """model"": ""gpt-3.5-turbo"","
    payload = payload & """messages"": [{"
    payload = payload & """role"": ""user"","
    payload = payload & """content"": ""Analiza los siguientes datos y proporciona un resumen conciso. Si son números, calcula el promedio. Si son texto, identifica temas principales. Responde en español. Datos de ejemplo: 100, 200, 150, 300, 250"""
    payload = payload & "}],"
    payload = payload & """max_tokens"": 500,"
    payload = payload & """temperature"": 0.7"
    payload = payload & "}"
    
    httpRequest.Send payload
    response = httpRequest.responseText
    
    If httpRequest.Status = 200 Then
        Dim parsedResponse As String
        parsedResponse = ParseOpenAIResponse(response)
        MsgBox "? Test con buen prompt exitoso!" & vbCrLf & vbCrLf & _
               "Respuesta: " & parsedResponse, vbInformation
    Else
        MsgBox "? Test falló: " & httpRequest.Status, vbCritical
    End If
    
    Exit Sub
    
TestError:
    MsgBox "? Error en test: " & Err.Description, vbCritical
End Sub

