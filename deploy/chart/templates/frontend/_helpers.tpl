{{- define "wiki.frontend.fullname" -}}
{{ include "wiki.fullname" . }}-frontend
{{- end }}

{{- define "wiki.frontend.matchLabels" -}}
app.kubernetes.io/name: {{ include "wiki.frontend.fullname" . }}
app: {{ include "wiki.frontend.fullname" . }}
{{- /*
app.kubernetes.io/instance: {{ .Release.Name }}
*/}}
{{- end }}

{{- define "wiki.frontend.labels" }}
{{- include "wiki.labels" . }}
{{ include "wiki.frontend.matchLabels" . }}
{{- end }}


{{- define "wiki.frontend.serviceAccountName" -}}
{{- if .Values.frontend.serviceAccount.create }}
{{- default (include "wiki.frontend.fullname" .) .Values.frontend.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.frontend.serviceAccount.name }}
{{- end }}
{{- end }}
