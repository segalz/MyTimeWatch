import { AppSettings, WorkSession, DayRecord } from '../types';

export interface BackupData {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  sessions: WorkSession[];
  dayRecords: Record<string, DayRecord>;
}

export const EMBEDDED_USER_BACKUP: BackupData = {
  "version": 1,
  "exportedAt": "2026-09-22T09:19:54.241Z",
  "settings": {
    "hourlyRate": 159.3,
    "overtime125Multiplier": 1.25,
    "overtime150Multiplier": 1.5,
    "fridayMultiplier": 1,
    "saturdayMultiplier": 1.5,
    "weeklyOvertimeEnabled": false,
    "weeklyOvertimeThresholdSeconds": 151200,
    "weeklyFirstTierSeconds": 7200,
    "showSecondsInLiveTimer": true,
    "schedule": {
      "0": {
        "requiredSeconds": 32400
      },
      "1": {
        "requiredSeconds": 32400
      },
      "2": {
        "requiredSeconds": 32400
      },
      "3": {
        "requiredSeconds": 32400
      },
      "4": {
        "requiredSeconds": 30600
      },
      "5": {
        "requiredSeconds": 0
      },
      "6": {
        "requiredSeconds": 0,
        "isRestDay": true
      }
    }
  },
  "sessions": [
    {
      "id": "demo_today_1",
      "localWorkDate": "2026-09-22",
      "startAtUtc": "2026-09-22T03:57:00.000Z",
      "endAtUtc": null,
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-22T03:57:00.000Z",
      "updatedAtUtc": "2026-09-22T03:57:00.000Z",
      "note": "כניסה ראשית"
    },
    {
      "id": "demo_1_1",
      "localWorkDate": "2026-09-21",
      "startAtUtc": "2026-09-21T03:57:00.000Z",
      "endAtUtc": "2026-09-21T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-21T03:57:00.000Z",
      "updatedAtUtc": "2026-09-21T07:00:00.000Z"
    },
    {
      "id": "demo_1_2",
      "localWorkDate": "2026-09-21",
      "startAtUtc": "2026-09-21T07:30:00.000Z",
      "endAtUtc": "2026-09-21T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-21T07:30:00.000Z",
      "updatedAtUtc": "2026-09-21T15:45:00.000Z"
    },
    {
      "id": "demo_2_1",
      "localWorkDate": "2026-09-20",
      "startAtUtc": "2026-09-20T03:57:00.000Z",
      "endAtUtc": "2026-09-20T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-20T03:57:00.000Z",
      "updatedAtUtc": "2026-09-20T07:00:00.000Z"
    },
    {
      "id": "demo_2_2",
      "localWorkDate": "2026-09-20",
      "startAtUtc": "2026-09-20T07:30:00.000Z",
      "endAtUtc": "2026-09-20T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-20T07:30:00.000Z",
      "updatedAtUtc": "2026-09-20T15:15:00.000Z"
    },
    {
      "id": "demo_5_1",
      "localWorkDate": "2026-09-17",
      "startAtUtc": "2026-09-17T03:57:00.000Z",
      "endAtUtc": "2026-09-17T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-17T03:57:00.000Z",
      "updatedAtUtc": "2026-09-17T07:00:00.000Z"
    },
    {
      "id": "demo_5_2",
      "localWorkDate": "2026-09-17",
      "startAtUtc": "2026-09-17T07:30:00.000Z",
      "endAtUtc": "2026-09-17T14:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-17T07:30:00.000Z",
      "updatedAtUtc": "2026-09-17T14:45:00.000Z"
    },
    {
      "id": "demo_6_1",
      "localWorkDate": "2026-09-16",
      "startAtUtc": "2026-09-16T03:57:00.000Z",
      "endAtUtc": "2026-09-16T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-16T03:57:00.000Z",
      "updatedAtUtc": "2026-09-16T07:00:00.000Z"
    },
    {
      "id": "demo_6_2",
      "localWorkDate": "2026-09-16",
      "startAtUtc": "2026-09-16T07:30:00.000Z",
      "endAtUtc": "2026-09-16T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-16T07:30:00.000Z",
      "updatedAtUtc": "2026-09-16T15:15:00.000Z"
    },
    {
      "id": "demo_7_1",
      "localWorkDate": "2026-09-15",
      "startAtUtc": "2026-09-15T03:57:00.000Z",
      "endAtUtc": "2026-09-15T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-15T03:57:00.000Z",
      "updatedAtUtc": "2026-09-15T07:00:00.000Z"
    },
    {
      "id": "demo_7_2",
      "localWorkDate": "2026-09-15",
      "startAtUtc": "2026-09-15T07:30:00.000Z",
      "endAtUtc": "2026-09-15T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-15T07:30:00.000Z",
      "updatedAtUtc": "2026-09-15T15:45:00.000Z"
    },
    {
      "id": "demo_8_1",
      "localWorkDate": "2026-09-14",
      "startAtUtc": "2026-09-14T03:57:00.000Z",
      "endAtUtc": "2026-09-14T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-14T03:57:00.000Z",
      "updatedAtUtc": "2026-09-14T07:00:00.000Z"
    },
    {
      "id": "demo_8_2",
      "localWorkDate": "2026-09-14",
      "startAtUtc": "2026-09-14T07:30:00.000Z",
      "endAtUtc": "2026-09-14T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-14T07:30:00.000Z",
      "updatedAtUtc": "2026-09-14T15:15:00.000Z"
    },
    {
      "id": "demo_9_1",
      "localWorkDate": "2026-09-13",
      "startAtUtc": "2026-09-13T03:57:00.000Z",
      "endAtUtc": "2026-09-13T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-13T03:57:00.000Z",
      "updatedAtUtc": "2026-09-13T07:00:00.000Z"
    },
    {
      "id": "demo_9_2",
      "localWorkDate": "2026-09-13",
      "startAtUtc": "2026-09-13T07:30:00.000Z",
      "endAtUtc": "2026-09-13T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-13T07:30:00.000Z",
      "updatedAtUtc": "2026-09-13T15:45:00.000Z"
    },
    {
      "id": "demo_12_1",
      "localWorkDate": "2026-09-10",
      "startAtUtc": "2026-09-10T03:57:00.000Z",
      "endAtUtc": "2026-09-10T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-10T03:57:00.000Z",
      "updatedAtUtc": "2026-09-10T07:00:00.000Z"
    },
    {
      "id": "demo_12_2",
      "localWorkDate": "2026-09-10",
      "startAtUtc": "2026-09-10T07:30:00.000Z",
      "endAtUtc": "2026-09-10T14:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-10T07:30:00.000Z",
      "updatedAtUtc": "2026-09-10T14:15:00.000Z"
    },
    {
      "id": "demo_13_1",
      "localWorkDate": "2026-09-09",
      "startAtUtc": "2026-09-09T03:57:00.000Z",
      "endAtUtc": "2026-09-09T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-09T03:57:00.000Z",
      "updatedAtUtc": "2026-09-09T07:00:00.000Z"
    },
    {
      "id": "demo_13_2",
      "localWorkDate": "2026-09-09",
      "startAtUtc": "2026-09-09T07:30:00.000Z",
      "endAtUtc": "2026-09-09T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-09T07:30:00.000Z",
      "updatedAtUtc": "2026-09-09T15:45:00.000Z"
    },
    {
      "id": "demo_14_1",
      "localWorkDate": "2026-09-08",
      "startAtUtc": "2026-09-08T03:57:00.000Z",
      "endAtUtc": "2026-09-08T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-08T03:57:00.000Z",
      "updatedAtUtc": "2026-09-08T07:00:00.000Z"
    },
    {
      "id": "demo_14_2",
      "localWorkDate": "2026-09-08",
      "startAtUtc": "2026-09-08T07:30:00.000Z",
      "endAtUtc": "2026-09-08T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-08T07:30:00.000Z",
      "updatedAtUtc": "2026-09-08T15:15:00.000Z"
    },
    {
      "id": "demo_15_1",
      "localWorkDate": "2026-09-07",
      "startAtUtc": "2026-09-07T03:57:00.000Z",
      "endAtUtc": "2026-09-07T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-07T03:57:00.000Z",
      "updatedAtUtc": "2026-09-07T07:00:00.000Z"
    },
    {
      "id": "demo_15_2",
      "localWorkDate": "2026-09-07",
      "startAtUtc": "2026-09-07T07:30:00.000Z",
      "endAtUtc": "2026-09-07T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-07T07:30:00.000Z",
      "updatedAtUtc": "2026-09-07T15:45:00.000Z"
    },
    {
      "id": "demo_16_1",
      "localWorkDate": "2026-09-06",
      "startAtUtc": "2026-09-06T03:57:00.000Z",
      "endAtUtc": "2026-09-06T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-06T03:57:00.000Z",
      "updatedAtUtc": "2026-09-06T07:00:00.000Z"
    },
    {
      "id": "demo_16_2",
      "localWorkDate": "2026-09-06",
      "startAtUtc": "2026-09-06T07:30:00.000Z",
      "endAtUtc": "2026-09-06T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-06T07:30:00.000Z",
      "updatedAtUtc": "2026-09-06T15:15:00.000Z"
    },
    {
      "id": "demo_19_1",
      "localWorkDate": "2026-09-03",
      "startAtUtc": "2026-09-03T03:57:00.000Z",
      "endAtUtc": "2026-09-03T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-03T03:57:00.000Z",
      "updatedAtUtc": "2026-09-03T07:00:00.000Z"
    },
    {
      "id": "demo_19_2",
      "localWorkDate": "2026-09-03",
      "startAtUtc": "2026-09-03T07:30:00.000Z",
      "endAtUtc": "2026-09-03T14:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-03T07:30:00.000Z",
      "updatedAtUtc": "2026-09-03T14:45:00.000Z"
    },
    {
      "id": "demo_20_1",
      "localWorkDate": "2026-09-02",
      "startAtUtc": "2026-09-02T03:57:00.000Z",
      "endAtUtc": "2026-09-02T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-02T03:57:00.000Z",
      "updatedAtUtc": "2026-09-02T07:00:00.000Z"
    },
    {
      "id": "demo_20_2",
      "localWorkDate": "2026-09-02",
      "startAtUtc": "2026-09-02T07:30:00.000Z",
      "endAtUtc": "2026-09-02T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-02T07:30:00.000Z",
      "updatedAtUtc": "2026-09-02T15:15:00.000Z"
    },
    {
      "id": "demo_21_1",
      "localWorkDate": "2026-09-01",
      "startAtUtc": "2026-09-01T03:57:00.000Z",
      "endAtUtc": "2026-09-01T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-01T03:57:00.000Z",
      "updatedAtUtc": "2026-09-01T07:00:00.000Z"
    },
    {
      "id": "demo_21_2",
      "localWorkDate": "2026-09-01",
      "startAtUtc": "2026-09-01T07:30:00.000Z",
      "endAtUtc": "2026-09-01T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-09-01T07:30:00.000Z",
      "updatedAtUtc": "2026-09-01T15:45:00.000Z"
    },
    {
      "id": "demo_22_1",
      "localWorkDate": "2026-08-31",
      "startAtUtc": "2026-08-31T03:57:00.000Z",
      "endAtUtc": "2026-08-31T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-31T03:57:00.000Z",
      "updatedAtUtc": "2026-08-31T07:00:00.000Z"
    },
    {
      "id": "demo_22_2",
      "localWorkDate": "2026-08-31",
      "startAtUtc": "2026-08-31T07:30:00.000Z",
      "endAtUtc": "2026-08-31T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-31T07:30:00.000Z",
      "updatedAtUtc": "2026-08-31T15:15:00.000Z"
    },
    {
      "id": "demo_23_1",
      "localWorkDate": "2026-08-30",
      "startAtUtc": "2026-08-30T03:57:00.000Z",
      "endAtUtc": "2026-08-30T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-30T03:57:00.000Z",
      "updatedAtUtc": "2026-08-30T07:00:00.000Z"
    },
    {
      "id": "demo_23_2",
      "localWorkDate": "2026-08-30",
      "startAtUtc": "2026-08-30T07:30:00.000Z",
      "endAtUtc": "2026-08-30T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-30T07:30:00.000Z",
      "updatedAtUtc": "2026-08-30T15:45:00.000Z"
    },
    {
      "id": "demo_26_1",
      "localWorkDate": "2026-08-27",
      "startAtUtc": "2026-08-27T03:57:00.000Z",
      "endAtUtc": "2026-08-27T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-27T03:57:00.000Z",
      "updatedAtUtc": "2026-08-27T07:00:00.000Z"
    },
    {
      "id": "demo_26_2",
      "localWorkDate": "2026-08-27",
      "startAtUtc": "2026-08-27T07:30:00.000Z",
      "endAtUtc": "2026-08-27T14:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-27T07:30:00.000Z",
      "updatedAtUtc": "2026-08-27T14:15:00.000Z"
    },
    {
      "id": "demo_27_1",
      "localWorkDate": "2026-08-26",
      "startAtUtc": "2026-08-26T03:57:00.000Z",
      "endAtUtc": "2026-08-26T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-26T03:57:00.000Z",
      "updatedAtUtc": "2026-08-26T07:00:00.000Z"
    },
    {
      "id": "demo_27_2",
      "localWorkDate": "2026-08-26",
      "startAtUtc": "2026-08-26T07:30:00.000Z",
      "endAtUtc": "2026-08-26T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-26T07:30:00.000Z",
      "updatedAtUtc": "2026-08-26T15:45:00.000Z"
    },
    {
      "id": "demo_28_1",
      "localWorkDate": "2026-08-25",
      "startAtUtc": "2026-08-25T03:57:00.000Z",
      "endAtUtc": "2026-08-25T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-25T03:57:00.000Z",
      "updatedAtUtc": "2026-08-25T07:00:00.000Z"
    },
    {
      "id": "demo_28_2",
      "localWorkDate": "2026-08-25",
      "startAtUtc": "2026-08-25T07:30:00.000Z",
      "endAtUtc": "2026-08-25T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-25T07:30:00.000Z",
      "updatedAtUtc": "2026-08-25T15:15:00.000Z"
    },
    {
      "id": "demo_29_1",
      "localWorkDate": "2026-08-24",
      "startAtUtc": "2026-08-24T03:57:00.000Z",
      "endAtUtc": "2026-08-24T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-24T03:57:00.000Z",
      "updatedAtUtc": "2026-08-24T07:00:00.000Z"
    },
    {
      "id": "demo_29_2",
      "localWorkDate": "2026-08-24",
      "startAtUtc": "2026-08-24T07:30:00.000Z",
      "endAtUtc": "2026-08-24T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-24T07:30:00.000Z",
      "updatedAtUtc": "2026-08-24T15:45:00.000Z"
    },
    {
      "id": "demo_30_1",
      "localWorkDate": "2026-08-23",
      "startAtUtc": "2026-08-23T03:57:00.000Z",
      "endAtUtc": "2026-08-23T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-23T03:57:00.000Z",
      "updatedAtUtc": "2026-08-23T07:00:00.000Z"
    },
    {
      "id": "demo_30_2",
      "localWorkDate": "2026-08-23",
      "startAtUtc": "2026-08-23T07:30:00.000Z",
      "endAtUtc": "2026-08-23T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-23T07:30:00.000Z",
      "updatedAtUtc": "2026-08-23T15:15:00.000Z"
    },
    {
      "id": "demo_33_1",
      "localWorkDate": "2026-08-20",
      "startAtUtc": "2026-08-20T03:57:00.000Z",
      "endAtUtc": "2026-08-20T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-20T03:57:00.000Z",
      "updatedAtUtc": "2026-08-20T07:00:00.000Z"
    },
    {
      "id": "demo_33_2",
      "localWorkDate": "2026-08-20",
      "startAtUtc": "2026-08-20T07:30:00.000Z",
      "endAtUtc": "2026-08-20T14:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-20T07:30:00.000Z",
      "updatedAtUtc": "2026-08-20T14:45:00.000Z"
    },
    {
      "id": "demo_34_1",
      "localWorkDate": "2026-08-19",
      "startAtUtc": "2026-08-19T03:57:00.000Z",
      "endAtUtc": "2026-08-19T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-19T03:57:00.000Z",
      "updatedAtUtc": "2026-08-19T07:00:00.000Z"
    },
    {
      "id": "demo_34_2",
      "localWorkDate": "2026-08-19",
      "startAtUtc": "2026-08-19T07:30:00.000Z",
      "endAtUtc": "2026-08-19T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-19T07:30:00.000Z",
      "updatedAtUtc": "2026-08-19T15:15:00.000Z"
    },
    {
      "id": "demo_35_1",
      "localWorkDate": "2026-08-18",
      "startAtUtc": "2026-08-18T03:57:00.000Z",
      "endAtUtc": "2026-08-18T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-18T03:57:00.000Z",
      "updatedAtUtc": "2026-08-18T07:00:00.000Z"
    },
    {
      "id": "demo_35_2",
      "localWorkDate": "2026-08-18",
      "startAtUtc": "2026-08-18T07:30:00.000Z",
      "endAtUtc": "2026-08-18T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-18T07:30:00.000Z",
      "updatedAtUtc": "2026-08-18T15:45:00.000Z"
    },
    {
      "id": "demo_36_1",
      "localWorkDate": "2026-08-17",
      "startAtUtc": "2026-08-17T03:57:00.000Z",
      "endAtUtc": "2026-08-17T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-17T03:57:00.000Z",
      "updatedAtUtc": "2026-08-17T07:00:00.000Z"
    },
    {
      "id": "demo_36_2",
      "localWorkDate": "2026-08-17",
      "startAtUtc": "2026-08-17T07:30:00.000Z",
      "endAtUtc": "2026-08-17T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-17T07:30:00.000Z",
      "updatedAtUtc": "2026-08-17T15:15:00.000Z"
    },
    {
      "id": "demo_37_1",
      "localWorkDate": "2026-08-16",
      "startAtUtc": "2026-08-16T03:57:00.000Z",
      "endAtUtc": "2026-08-16T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-16T03:57:00.000Z",
      "updatedAtUtc": "2026-08-16T07:00:00.000Z"
    },
    {
      "id": "demo_37_2",
      "localWorkDate": "2026-08-16",
      "startAtUtc": "2026-08-16T07:30:00.000Z",
      "endAtUtc": "2026-08-16T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-16T07:30:00.000Z",
      "updatedAtUtc": "2026-08-16T15:45:00.000Z"
    },
    {
      "id": "demo_40_1",
      "localWorkDate": "2026-08-13",
      "startAtUtc": "2026-08-13T03:57:00.000Z",
      "endAtUtc": "2026-08-13T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-13T03:57:00.000Z",
      "updatedAtUtc": "2026-08-13T07:00:00.000Z"
    },
    {
      "id": "demo_40_2",
      "localWorkDate": "2026-08-13",
      "startAtUtc": "2026-08-13T07:30:00.000Z",
      "endAtUtc": "2026-08-13T14:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-13T07:30:00.000Z",
      "updatedAtUtc": "2026-08-13T14:15:00.000Z"
    },
    {
      "id": "demo_41_1",
      "localWorkDate": "2026-08-12",
      "startAtUtc": "2026-08-12T03:57:00.000Z",
      "endAtUtc": "2026-08-12T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-12T03:57:00.000Z",
      "updatedAtUtc": "2026-08-12T07:00:00.000Z"
    },
    {
      "id": "demo_41_2",
      "localWorkDate": "2026-08-12",
      "startAtUtc": "2026-08-12T07:30:00.000Z",
      "endAtUtc": "2026-08-12T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-12T07:30:00.000Z",
      "updatedAtUtc": "2026-08-12T15:45:00.000Z"
    },
    {
      "id": "demo_42_1",
      "localWorkDate": "2026-08-11",
      "startAtUtc": "2026-08-11T03:57:00.000Z",
      "endAtUtc": "2026-08-11T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-11T03:57:00.000Z",
      "updatedAtUtc": "2026-08-11T07:00:00.000Z"
    },
    {
      "id": "demo_42_2",
      "localWorkDate": "2026-08-11",
      "startAtUtc": "2026-08-11T07:30:00.000Z",
      "endAtUtc": "2026-08-11T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-11T07:30:00.000Z",
      "updatedAtUtc": "2026-08-11T15:15:00.000Z"
    },
    {
      "id": "demo_43_1",
      "localWorkDate": "2026-08-10",
      "startAtUtc": "2026-08-10T03:57:00.000Z",
      "endAtUtc": "2026-08-10T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-10T03:57:00.000Z",
      "updatedAtUtc": "2026-08-10T07:00:00.000Z"
    },
    {
      "id": "demo_43_2",
      "localWorkDate": "2026-08-10",
      "startAtUtc": "2026-08-10T07:30:00.000Z",
      "endAtUtc": "2026-08-10T15:45:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-10T07:30:00.000Z",
      "updatedAtUtc": "2026-08-10T15:45:00.000Z"
    },
    {
      "id": "demo_44_1",
      "localWorkDate": "2026-08-09",
      "startAtUtc": "2026-08-09T03:57:00.000Z",
      "endAtUtc": "2026-08-09T07:00:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-09T03:57:00.000Z",
      "updatedAtUtc": "2026-08-09T07:00:00.000Z"
    },
    {
      "id": "demo_44_2",
      "localWorkDate": "2026-08-09",
      "startAtUtc": "2026-08-09T07:30:00.000Z",
      "endAtUtc": "2026-08-09T15:15:00.000Z",
      "timezoneOffsetMinutes": -180,
      "source": "CLOCK",
      "isManuallyEdited": false,
      "createdAtUtc": "2026-08-09T07:30:00.000Z",
      "updatedAtUtc": "2026-08-09T15:15:00.000Z"
    }
  ],
  "dayRecords": {}
};
