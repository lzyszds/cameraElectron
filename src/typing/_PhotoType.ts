export interface videoFileDataType {
  fileName: string;
  createTime: string;
  fileSize: number;
  filePath: string;
}

export interface MediaparasType {
  // 媒体流对象
  mediaStream: MediaStream | null;
  // 媒体录制对象
  mediaRecorder: MediaRecorder | null;
  // 录制的数据块
  chunks: BlobPart[];
  //录制时间
  time: number;
  //文件大小
  fileSize: number;
}
