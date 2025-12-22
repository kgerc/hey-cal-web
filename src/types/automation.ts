export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  createdAt: string;
}

export interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "greaterThan" | "lessThan";
  value: any;
}

export interface RuleAction {
  type: "setNotificationChannel" | "useTemplate" | "sendReminder";
  value: any;
}
