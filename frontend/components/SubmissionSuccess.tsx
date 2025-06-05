import React from 'react';
import { CheckCircleFilled } from '@ant-design/icons';
import { Card, Button } from 'antd';

interface SubmissionSuccessProps {
  title?: string;
  message?: string;
  onClose?: () => void;
  showButton?: boolean;
  buttonText?: string;
}

const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  title = 'Submission Successful!',
  message = 'Your documents have been successfully uploaded and submitted.',
  onClose,
  showButton = true,
  buttonText = 'Close'
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="w-full max-w-lg mx-4">
        <Card 
          className="border-none shadow-2xl"
          bodyStyle={{ padding: 0 }}
        >
          {/* Success Content */}
          <div className="p-8">
            {/* Icon Container with Gradient Background */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg">
                <CheckCircleFilled className="text-5xl text-white" />
              </div>
            </div>

            {/* Title with Decorative Line */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {title}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full"></div>
            </div>

            {/* Message with Better Typography */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                {message}
              </p>
            </div>

            {/* Button with Enhanced Styling */}
            {showButton && (
              <div className="flex justify-center">
                <Button
                  type="primary"
                  size="large"
                  onClick={onClose}
                  className="h-12 px-8 bg-gradient-to-r from-blue-500 to-blue-600 
                           border-none hover:from-blue-600 hover:to-blue-700 
                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                           shadow-lg hover:shadow-xl transition-all duration-300
                           text-base font-medium rounded-lg"
                >
                  {buttonText}
                </Button>
              </div>
            )}
          </div>

          {/* Decorative Footer */}
          <div className="h-2 bg-gradient-to-r from-green-400 via-blue-500 to-emerald-500 rounded-b-lg"></div>
        </Card>
      </div>
    </div>
  );
};

export default SubmissionSuccess; 