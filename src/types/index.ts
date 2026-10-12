export type { ApiResponse } from './api'
export type {
  RoleCode,
  User,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  CurrentUser,
  ChangePasswordRequest,
} from './auth'
export type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  TherapistOption,
} from './user'
export type {
  RoleResponse,
  UpdateRolePermissionsRequest,
  PermissionCodeDef,
  PermissionGroup,
} from './role'
export { PERMISSION_GROUPS } from './role'
export type {
  ClientStatus,
  TherapistClientStatus,
  TherapistInfo,
  ClientProfile,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearchParams,
  ChangeStatusRequest,
  AssignTherapistRequest,
  TransferTherapistRequest,
  InitialCredentials,
} from './client'
export type {
  ConsentTriggerEvent,
  ConsentRecordStatus,
  ConsentTemplate,
  CreateConsentTemplateRequest,
  UpdateConsentTemplateRequest,
  ConsentRecord,
  ConsentRecordSearchParams,
  SignConsentRequest,
  VoidConsentRequest,
} from './consent'
export type {
  Room,
  TherapistRoomInfo,
  CreateRoomRequest,
  UpdateRoomRequest,
  AssignTherapistToRoomRequest,
  ActiveRoomCount,
} from './room'
export type {
  DayOfWeek,
  ScheduleTemplate,
  CreateScheduleTemplateRequest,
  UpdateScheduleTemplateRequest,
  SlotStatus,
  ScheduleSlot,
  ExpandScheduleRequest,
  ManualExpandRequest,
  ExpandResult,
  BlockSlotRequest,
  SlotListParams,
} from './schedule'
export type {
  AppointmentStatus,
  SessionType,
  VisitType,
  SeriesFrequency,
  SeriesStatus,
  Appointment,
  CreateAppointmentRequest,
  RescheduleRequest,
  AppointmentNoteRequest,
  AppointmentSearchParams,
  CalendarEvent,
  AppointmentSeries,
  CreateSeriesRequest,
  RenewSeriesRequest,
} from './appointment'
export type {
  FieldType,
  FormTemplateType,
  FormFieldResponse,
  FormSectionResponse,
  FormTemplateResponse,
  CreateFormFieldRequest,
  CreateFormSectionRequest,
  CreateFormTemplateRequest,
  UpdateFormTemplateRequest,
  FieldValueRequest,
  SubmitFormRequest,
  FieldValueResponse,
  FormSubmissionResponse,
} from './form'
export type {
  SessionNoteFormat,
  SessionNoteType,
  SessionNote,
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
} from './sessionNote'
export type {
  PhraseCategory,
  PhraseTemplate,
  CreatePhraseRequest,
  UpdatePhraseRequest,
} from './phrase'
export type {
  MemoCategory,
  ClientMemo,
  CreateMemoRequest,
  UpdateMemoRequest,
} from './clientMemo'
export type {
  FeeSchedule,
  CreateFeeScheduleRequest,
  UpdateFeeScheduleRequest,
  Package,
  CreatePackageRequest,
  UpdatePackageRequest,
  DiscountType,
  Discount,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  AssignDiscountRequest,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  ClientPackageStatus,
  BillingRecord,
  BillingSearchParams,
  ConfirmPaymentRequest,
  RefundRequest,
  PackagePurchase,
  PurchasePackageRequest,
  MonthlyRevenue,
  TherapistRevenue,
  PackageRemaining,
  PackageStats,
} from './billing'
export type {
  NotificationChannel,
  NotificationEventType,
  NotificationStatus,
  NotificationTemplate,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  Notification,
  NotificationPreference,
  UpdatePreferenceRequest,
  UnreadCount,
} from './notification'
export { notificationEventMeta } from './notification'
export type {
  ReviewVisibility,
  ViolationStatus,
  ViolationSeverity,
  TherapistMetrics,
  PerformanceReview,
  CreatePerformanceReviewRequest,
  UpdatePerformanceReviewRequest,
  SetVisibilityRequest,
  ViolationRecord,
  CreateViolationRecordRequest,
  UpdateViolationRecordRequest,
  ResolveViolationRequest,
  MetricsSearchParams,
  MetricsTrend,
  MetricsTrendParams,
} from './performance'
export type {
  AuditLog,
  AuditSearchParams,
  AuditExportParams,
} from './audit'
export type { Organization, UpdateOrganizationRequest } from './organization'
