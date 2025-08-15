import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = ({ items = [], className = "" }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment.replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      // Special cases for better labels
      const labelMap = {
        'browse-gigs': 'Browse Services',
        'place-order': 'Place Order',
        'order-success': 'Order Success',
        'track-orders': 'Track Orders',
        'my-gigs': 'My Services',
        'create-gig': 'Create Service',
        'edit-gig': 'Edit Service'
      };
      
      if (labelMap[segment]) {
        label = labelMap[segment];
      }

      breadcrumbs.push({
        label,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight size={14} className="text-gray-400 mx-2" />
          )}
          {item.isActive ? (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1"
            >
              {index === 0 && <Home size={14} />}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;