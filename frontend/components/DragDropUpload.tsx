import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

const DragDropUpload: React.FC = () => {
  const props: UploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Dragger {...props} className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
      <p className="ant-upload-drag-icon">
        <InboxOutlined className="text-3xl text-blue-500" />
      </p>
      <p className="ant-upload-text text-lg font-medium">
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint text-sm text-gray-500">
        Support for single or multiple file uploads. Drag and drop files here or click to browse.
      </p>
    </Dragger>
  );
};

export default DragDropUpload;  